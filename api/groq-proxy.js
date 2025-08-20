// Ce fichier est une fonction "serverless" Vercel.
// Il reçoit les requêtes de l'application, appelle l'API Groq en utilisant
// la clé API secrète stockée dans les variables d'environnement de Vercel,
// et renvoie la réponse à l'application.
// La clé API n'est jamais exposée au navigateur.

// Une fonction d'aide pour envoyer des réponses JSON de manière cohérente
const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data);
};

// Dictionnaire de mots clés pour la détection de langue (plus efficace que les regex)
const LANGUAGE_KEYWORDS = {
  français: ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'de', 'du', 'que', 'qui', 'avec', 'dans', 'pour', 'sur', 'par', 'est', 'sont', 'avoir', 'être', 'vous', 'nous', 'ils', 'elle'],
  anglais: ['the', 'and', 'or', 'that', 'which', 'with', 'in', 'for', 'on', 'by', 'of', 'is', 'are', 'have', 'be', 'to', 'you', 'we', 'they', 'she', 'he'],
  espagnol: ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'que', 'con', 'en', 'para', 'por', 'de', 'es', 'son', 'tener', 'ser', 'estar', 'usted', 'nosotros']
};

// Fonction optimisée pour détecter la langue d'un texte
const detectLanguage = (text) => {
  // Convertir en minuscules pour une recherche insensible à la casse
  const lowerText = text.toLowerCase();
  
  // Compter les occurrences de mots clés pour chaque langue
  const scores = {
    français: 0,
    anglais: 0,
    espagnol: 0
  };
  
  // Parcourir chaque langue et compter les mots clés trouvés
  for (const [lang, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    for (const keyword of keywords) {
      // Utiliser une expression régulière avec des limites de mots pour des correspondances exactes
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        scores[lang] += matches.length;
      }
    }
  }
  
  // Trouver la langue avec le score le plus élevé
  let maxScore = 0;
  let detectedLang = 'français'; // Par défaut
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }
  
  // Si aucun score significatif, retourner la langue par défaut
  return maxScore > 0 ? detectedLang : 'français';
};

// Fonction pour créer le prompt de traduction optimisé
const createTranslationPrompt = (text, targetLang, detectedLang) => {
  // Cartographie des langues pour une meilleure cohérence
  const languageMap = {
    'fr': 'français',
    'en': 'anglais', 
    'es': 'espagnol'
  };
  
  if (targetLang === 'auto') {
    // Logique de traduction automatique
    const targetLanguage = detectedLang === 'français' ? 'anglais' : 'français';
    
    return {
      system: `Tu es un traducteur professionnel. Traduis le texte suivant du ${detectedLang} vers le ${targetLanguage}. Fournis uniquement la traduction, sans aucune explication.`,
      user: text,
      targetLanguage
    };
  } else {
    // Mode langue spécifique
    const targetLanguage = languageMap[targetLang] || 'anglais';
    
    return {
      system: `Tu es un traducteur professionnel. Traduis le texte suivant vers le ${targetLanguage}. Fournis uniquement la traduction, sans aucune explication.`,
      user: text,
      targetLanguage
    };
  }
};

// Fonction pour gérer le streaming de manière robuste
const handleStream = async (response, groqResponse) => {
  if (!groqResponse.body) {
    throw new Error('Pas de réponse du serveur Groq');
  }
  
  console.log('Streaming démarré depuis Groq...');
  
  // Stream les données directement avec gestion des chunks
  const reader = groqResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log('Streaming Groq terminé');
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Traiter les lignes complètes seulement
      let lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Garder la dernière ligne incomplète
      
      for (const line of lines) {
        if (line.trim()) {
          response.write(`${line}\n`);
          
          // Forcer l'envoi immédiat
          if (response.flush) {
            response.flush();
          }
        }
      }
    }
    
    // Traiter le buffer restant
    if (buffer.trim()) {
      response.write(`${buffer}\n`);
    }
  } catch (streamError) {
    console.error('Erreur dans le streaming:', streamError);
    throw new Error('Erreur de streaming');
  }
};

// Utilisation de l'exportation par défaut pour la compatibilité avec les modules ES
export default async function handler(request, response) {
  // Accepter uniquement les requêtes POST
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method Not Allowed' });
  }
  
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    // Vérifier si la clé API est configurée sur le serveur Vercel
    if (!groqApiKey) {
      console.error('La variable d\'environnement GROQ_API_KEY n\'est pas configurée sur le serveur.');
      return sendJson(response, 500, { error: "La configuration du serveur est incomplète." });
    }
    
    // Vercel analyse généralement le corps pour le JSON, mais nous ajoutons une vérification pour la robustesse.
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
    
    if (type === 'summarize') {
      const model = "llama3-70b-8192";
      const { text } = payload;
      
      if (!text) {
        return sendJson(response, 400, { error: 'Le texte pour le résumé est manquant.' });
      }
      
      const messages = [
        { role: "system", content: "Tu es un assistant expert en pneumologie. Ton rôle est de résumer des transcriptions de conférences de manière concise et claire, en structurant le résumé en quelques points clés importants sur des lignes séparées." },
        { role: "user", content: `Voici la transcription:\n\n"${text}"` }
      ];
      
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, model })
        });
        
        if (!groqResponse.ok) {
          const errorBody = await groqResponse.text();
          console.error('Erreur API Groq (summarize):', errorBody);
          throw new Error(`L'API Groq a répondu avec le statut ${groqResponse.status}`);
        }
        
        const groqData = await groqResponse.json();
        const resultText = groqData.choices[0]?.message?.content?.trim() || null;
        
        if (resultText) {
          return sendJson(response, 200, { result: resultText });
        } else {
          return sendJson(response, 500, { error: "La réponse de l'API Groq était vide ou malformée." });
        }
      } catch (error) {
        console.error('Erreur lors de la résumé:', error);
        return sendJson(response, 500, { error: `Erreur lors du résumé: ${error.message}` });
      }
    } else if (type === 'translate') {
      const model = "llama3-8b-8192"; // Modèle rapide pour le streaming
      const { text, targetLang } = payload;
      
      if (!text) {
        return sendJson(response, 400, { error: 'Le texte pour la traduction est manquant.' });
      }
      
      // Validation de la langue cible
      if (targetLang && !['auto', 'fr', 'en', 'es'].includes(targetLang)) {
        return sendJson(response, 400, { error: 'Langue cible non supportée.' });
      }
      
      // Détecter la langue du texte d'entrée
      const detectedSourceLang = detectLanguage(text);
      
      // Créer le prompt adapté
      const prompts = createTranslationPrompt(text, targetLang || 'auto', detectedSourceLang);
      
      const messages = [
        { role: "system", content: prompts.system },
        { role: "user", content: prompts.user }
      ];
      
      // Configuration headers AVANT l'appel à l'API
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'POST');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      // Envoyer immédiatement les informations de détection
      if (targetLang === 'auto') {
        const detectionData = JSON.stringify({
          choices: [{
            delta: { content: '' },
            detected_language: detectedSourceLang
          }]
        });
        response.write(`data: ${detectionData}\n\n`);
      }
      
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
            stream: true,
            temperature: 0.1,      // Légère variété pour un rendu plus naturel
            max_tokens: 500,     // Augmenter pour permettre des traductions plus longues
            top_p: 0.9,          // Légère réduction pour plus de cohérence
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
            stop: null           // Pas de mots d'arrêt
          })
        });
        
        if (!groqResponse.ok) {
          const errorBody = await groqResponse.text();
          console.error('Erreur API Groq (translate):', groqResponse.status, errorBody);
          response.write(`data: {"error": "API Groq Error: ${groqResponse.status}"}\n\n`);
          response.write('data: [DONE]\n\n');
          response.end();
          return;
        }
        
        // Utiliser la fonction dédiée pour gérer le streaming
        await handleStream(response, groqResponse);
        
        // Terminer le stream
        response.write('data: [DONE]\n\n');
        response.end();
        return;
      } catch (groqError) {
        console.error('Erreur lors de l\'appel Groq:', groqError);
        response.write(`data: {"error": "Erreur de connexion à Groq: ${groqError.message}"}\n\n`);
        response.write('data: [DONE]\n\n');
        response.end();
        return;
      }
    } else {
      return sendJson(response, 400, { error: 'Type de requête invalide.' });
    }
  } catch (error) {
    console.error('Erreur dans la fonction proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur interne du serveur est survenue.';
    
    if (!response.headersSent) {
      return sendJson(response, 500, { error: errorMessage });
    } else {
      // Si les headers sont déjà envoyés, on termine le stream avec une erreur
      response.write(`data: {"error": "${errorMessage}"}\n\n`);
      response.write('data: [DONE]\n\n');
      response.end();
    }
  }
}