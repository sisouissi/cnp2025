// Ce fichier est une fonction "serverless" Vercel.
// Il reçoit les requêtes de l'application, appelle l'API Groq en utilisant
// la clé API secrète stockée dans les variables d'environnement de Vercel,
// et renvoie la réponse à l'application.
// La clé API n'est jamais exposée au navigateur.

// Une fonction d'aide pour envoyer des réponses JSON de manière cohérente
const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data);
};

// Fonction pour détecter la langue d'un texte
const detectLanguage = (text) => {
  // Détection simple basée sur des patterns courants
  const patterns = {
    'français': /\b(le|la|les|un|une|des|et|ou|que|qui|avec|dans|pour|sur|par|de|du|est|sont|avoir|être)\b/i,
    'anglais': /\b(the|and|or|that|which|with|in|for|on|by|of|is|are|have|be|to|a|an)\b/i,
    'espagnol': /\b(el|la|los|las|un|una|y|o|que|con|en|para|por|de|es|son|tener|ser|estar)\b/i,
    'arabe': /[\u0600-\u06FF]/
  };

  let scores = {};
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    const matches = text.match(new RegExp(pattern.source, 'gi')) || [];
    scores[lang] = matches.length;
  }

  // Retourner la langue avec le score le plus élevé
  const detectedLang = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  return scores[detectedLang] > 0 ? detectedLang : 'inconnu';
};

// Fonction pour créer le prompt de traduction adapté
const createTranslationPrompt = (text, targetLang, langName) => {
  if (targetLang === 'auto') {
    // Mode détection automatique
    return {
      system: `You are an intelligent translation assistant. Your task is to:
1. Detect the language of the input text
2. Translate it to the most appropriate target language based on context
3. If the text is in French, translate to English
4. If the text is in English, translate to French  
5. If the text is in another language, translate to French
6. Provide only the direct translation without any explanations.`,
      user: text
    };
  } else {
    // Mode langue spécifique
    const languageMap = {
      'fr': 'French',
      'en': 'English', 
      'es': 'Spanish',
      'ar': 'Arabic'
    };
    
    const targetLanguage = languageMap[targetLang] || langName;
    
    return {
      system: `You are a professional translation assistant. Translate the following text to ${targetLanguage}. Provide only the direct translation, without any extra phrases, explanations, or formatting.`,
      user: text
    };
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
    // Si le corps est une chaîne, nous l'analysons. Sinon, nous l'utilisons directement.
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const { type, payload } = body || {};

    if (!type || !payload) {
      return sendJson(response, 400, { error: 'La requête est malformée. Le type ou le payload est manquant.' });
    }

    if (type === 'summarize') {
      const model = "llama3-70b-8192"; // Utiliser un modèle plus puissant pour des résumés de meilleure qualité
      const { text } = payload;
      if (!text) {
        return sendJson(response, 400, { error: 'Le texte pour le résumé est manquant.' });
      }
      const messages = [
        { role: "system", content: "Tu es un assistant expert en pneumologie. Ton rôle est de résumer des transcriptions de conférences de manière concise et claire, en structurant le résumé en quelques points clés importants sur des lignes séparées." },
        { role: "user", content: `Voici la transcription:\n\n"${text}"` }
      ];

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

    } else if (type === 'translate') {
      const model = "llama3-8b-8192"; // Utiliser un modèle plus rapide pour une traduction fluide en temps réel
      const { text, langName, targetLang } = payload;
      
      if (!text) {
        return sendJson(response, 400, { error: 'Le texte pour la traduction est manquant.' });
      }

      // Détecter la langue du texte d'entrée pour le mode automatique
      const detectedSourceLang = detectLanguage(text);
      
      // Créer le prompt adapté selon le mode
      const prompts = createTranslationPrompt(text, targetLang, langName);
      
      const messages = [
        { role: "system", content: prompts.system },
        { role: "user", content: prompts.user }
      ];

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
          temperature: 0.3, // Réduire la créativité pour des traductions plus précises
          max_tokens: 1000 // Limiter la longueur de réponse
        })
      });

      if (!groqResponse.ok) {
        const errorBody = await groqResponse.text();
        console.error('Erreur API Groq (translate):', errorBody);
        return sendJson(response, groqResponse.status, { 
          error: `L'API Groq a répondu avec le statut ${groqResponse.status}` 
        });
      }

      // Configuration des headers pour le streaming
      response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.setHeader('Pragma', 'no-cache');
      response.setHeader('Expires', '0');
      response.setHeader('Connection', 'keep-alive');
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'POST');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Envoyer les informations de détection de langue au début du stream
      if (targetLang === 'auto') {
        const detectionInfo = JSON.stringify({
          choices: [{
            delta: { content: '' },
            detected_language: detectedSourceLang
          }]
        });
        response.write(`data: ${detectionInfo}\n\n`);
      }

      try {
        const reader = groqResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              // Transférer les données du stream Groq vers le client
              response.write(`${line}\n`);
              
              // Flush immédiatement pour réduire la latence
              if (response.flush) {
                response.flush();
              }
            }
          }
        }

        // Envoyer le signal de fin
        response.write('data: [DONE]\n\n');
        response.end();
        return;

      } catch (streamError) {
        console.error('Erreur lors du streaming:', streamError);
        if (!response.headersSent) {
          return sendJson(response, 500, { 
            error: 'Erreur lors du streaming de la traduction' 
          });
        } else {
          response.write(`data: {"error": "Erreur de streaming"}\n\n`);
          response.end();
        }
      }

    } else {
      return sendJson(response, 400, { error: 'Type de requête invalide.' });
    }

  } catch (error) {
    console.error('Erreur dans la fonction proxy:', error);
    // S'assurer que nous envoyons toujours une réponse d'erreur JSON
    const errorMessage = error instanceof Error ? error.message : 'Une erreur interne du serveur est survenue.';
    if (!response.headersSent) {
      return sendJson(response, 500, { error: errorMessage });
    }
  }
}