// Ce fichier est une fonction "serverless" Vercel.
// Il reçoit les requêtes de l'application, appelle l'API Groq en utilisant
// la clé API secrète stockée dans les variables d'environnement de Vercel,
// et renvoie la réponse à l'application.
// La clé API n'est jamais exposée au navigateur.

const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data);
};

// Dictionnaire de mots clés pour la détection de langue
const LANGUAGE_KEYWORDS = {
  français: ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'de', 'du', 'que', 'qui', 'avec', 'dans', 'pour', 'sur', 'par', 'est', 'sont', 'avoir', 'être', 'vous', 'nous', 'ils', 'elle'],
  anglais: ['the', 'and', 'or', 'that', 'which', 'with', 'in', 'for', 'on', 'by', 'of', 'is', 'are', 'have', 'be', 'to', 'you', 'we', 'they', 'she', 'he'],
  espagnol: ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'que', 'con', 'en', 'para', 'por', 'de', 'es', 'son', 'tener', 'ser', 'estar', 'usted', 'nosotros']
};

// Fonction optimisée pour détecter la langue d'un texte
const detectLanguage = (text) => {
  const lowerText = text.toLowerCase();
  
  const scores = {
    français: 0,
    anglais: 0,
    espagnol: 0
  };
  
  for (const [lang, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        scores[lang] += matches.length;
      }
    }
  }
  
  let maxScore = 0;
  let detectedLang = 'français';
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }
  
  return maxScore > 0 ? detectedLang : 'français';
};

// Fonction pour créer le prompt de traduction optimisé
const createTranslationPrompt = (text, targetLang, detectedLang) => {
  const languageMap = {
    'fr': 'French',
    'en': 'English', 
    'es': 'Spanish'
  };
  
  let sourceLangEnglish = languageMap[detectedLang === 'français' ? 'fr' : 
                               detectedLang === 'anglais' ? 'en' : 
                               detectedLang === 'espagnol' ? 'es' : 'fr'] || 'French';
  
  let targetLanguage = targetLang === 'auto' ? 
    (sourceLangEnglish === 'French' ? 'English' : 'French') : 
    (languageMap[targetLang] || 'English');
  
  return {
    system: `You are a professional translator. Translate the following text from ${sourceLangEnglish} to ${targetLanguage}. 
             Provide ONLY the translation without any explanations, greetings, or additional text. 
             Maintain the original meaning and tone.`,
    user: text,
    targetLanguage: targetLanguage.toLowerCase()
  };
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method Not Allowed' });
  }
  
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      console.error('La variable d\'environnement GROQ_API_KEY n\'est pas configurée sur le serveur.');
      return sendJson(response, 500, { error: "La configuration du serveur est incomplète." });
    }
    
    let body;
    try {
      body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    } catch (parseError) {
      console.error('Erreur parsing du body:', parseError);
      return sendJson(response, 400, { error: 'Corps de requête JSON invalide.' });
    }
    
    const { type, payload } = body || {};
    
    if (!type || !payload) {
      return sendJson(response, 400, { error: 'La requête est malformée. Le type ou le payload est manquant.' });
    }
    
    if (type === 'translate') {
      const model = "llama3-8b-8192"; // Modèle rapide pour la traduction
      const { text, targetLang } = payload;
      
      if (!text) {
        return sendJson(response, 400, { error: 'Le texte pour la traduction est manquant.' });
      }
      
      if (targetLang && !['auto', 'fr', 'en', 'es'].includes(targetLang)) {
        return sendJson(response, 400, { error: 'Langue cible non supportée.' });
      }
      
      // Nettoyer le texte
      const cleanText = text.trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\"\'\@]/g, '');
      
      const detectedSourceLang = detectLanguage(cleanText);
      const prompts = createTranslationPrompt(cleanText, targetLang || 'auto', detectedSourceLang);
      
      const messages = [
        { role: "system", content: prompts.system },
        { role: "user", content: prompts.user }
      ];
      
      try {
        console.log('Appel à l\'API Groq pour traduction...');
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${groqApiKey}`, 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            messages, 
            model,
            stream: false, // Pas de streaming pour une réponse plus rapide
            temperature: 0.1,
            max_tokens: 500,
            top_p: 0.9,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
          })
        });
        
        if (!groqResponse.ok) {
          const errorBody = await groqResponse.text();
          console.error('Erreur API Groq (translate):', groqResponse.status, errorBody);
          return sendJson(response, 500, { error: `Erreur de traduction: ${groqResponse.status}` });
        }
        
        const groqData = await groqResponse.json();
        const resultText = groqData.choices[0]?.message?.content?.trim() || null;
        
        if (resultText) {
          return sendJson(response, 200, { 
            result: resultText,
            detected_language: detectedSourceLang
          });
        } else {
          return sendJson(response, 500, { error: "La réponse de l'API Groq était vide ou malformée." });
        }
      } catch (groqError) {
        console.error('Erreur lors de l\'appel Groq:', groqError);
        return sendJson(response, 500, { error: `Erreur de connexion à Groq: ${groqError.message}` });
      }
    } else {
      return sendJson(response, 400, { error: 'Type de requête invalide.' });
    }
  } catch (error) {
    console.error('Erreur dans la fonction proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur interne du serveur est survenue.';
    return sendJson(response, 500, { error: errorMessage });
  }
}