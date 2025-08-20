// Ce fichier est une fonction "serverless" Vercel.
// Il reçoit les requêtes de l'application, appelle l'API Groq en utilisant
// la clé API secrète stockée dans les variables d'environnement de Vercel,
// et renvoie la réponse à l'application.
// La clé API n'est jamais exposée au navigateur.

// Une fonction d'aide pour envoyer des réponses JSON de manière cohérente
const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data);
};

// Fonction simplifiée pour détecter la langue d'un texte
const detectLanguage = (text) => {
  // Patterns plus simples et efficaces
  if (/\b(le|la|les|un|une|des|et|de|du|que|qui|avec|dans|pour|sur|par|est|sont|avoir|être|vous|nous|ils|elle)\b/i.test(text)) {
    return 'français';
  }
  if (/\b(the|and|or|that|which|with|in|for|on|by|of|is|are|have|be|to|you|we|they|she|he)\b/i.test(text)) {
    return 'anglais';
  }
  if (/\b(el|la|los|las|un|una|y|o|que|con|en|para|por|de|es|son|tener|ser|estar|usted|nosotros)\b/i.test(text)) {
    return 'espagnol';
  }
  return 'français'; // Par défaut
};

// Fonction pour créer le prompt de traduction optimisé
const createTranslationPrompt = (text, targetLang, detectedLang) => {
  if (targetLang === 'auto') {
    // Logique de traduction automatique simplifiée
    if (detectedLang === 'français') {
      return {
        system: `You are a professional translator. Translate the following French text to English. Provide only the translation, no explanations.`,
        user: text,
        targetLanguage: 'anglais'
      };
    } else if (detectedLang === 'anglais') {
      return {
        system: `You are a professional translator. Translate the following English text to French. Provide only the translation, no explanations.`,
        user: text,
        targetLanguage: 'français'
      };
    } else {
      return {
        system: `You are a professional translator. Translate the following text to French. Provide only the translation, no explanations.`,
        user: text,
        targetLanguage: 'français'
      };
    }
  } else {
    // Mode langue spécifique
    const languageMap = {
      'fr': 'French',
      'en': 'English', 
      'es': 'Spanish'
    };
    
    const targetLanguage = languageMap[targetLang] || 'English';
    
    return {
      system: `You are a professional translator. Translate the following text to ${targetLanguage}. Provide only the translation, no explanations.`,
      user: text,
      targetLanguage: targetLanguage.toLowerCase()
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
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
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
      const model = "llama3-8b-8192"; // Modèle rapide pour le streaming
      const { text, targetLang } = payload;
      
      if (!text) {
        return sendJson(response, 400, { error: 'Le texte pour la traduction est manquant.' });
      }

      // Détecter la langue du texte d'entrée
      const detectedSourceLang = detectLanguage(text);
      
      // Créer le prompt adapté
      const prompts = createTranslationPrompt(text, targetLang, detectedSourceLang);
      
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
            temperature: 0.1, // Très faible pour plus de cohérence
            max_tokens: 500,   // Limite raisonnable
            top_p: 0.9
          })
        });

        if (!groqResponse.ok) {
          const errorBody = await groqResponse.text();
          console.error('Erreur API Groq (translate):', errorBody);
          response.write(`data: {"error": "API Error: ${groqResponse.status}"}\n\n`);
          response.write('data: [DONE]\n\n');
          response.end();
          return;
        }

        // Stream les données directement
        const reader = groqResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Traiter toutes les lignes complètes
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line && line.startsWith('data: ')) {
              // Transférer directement la ligne
              response.write(`${line}\n\n`);
            }
          }
          
          // Garder la dernière ligne incomplète dans le buffer
          buffer = lines[lines.length - 1];
        }

        // Traiter toute donnée restante dans le buffer
        if (buffer.trim()) {
          const line = buffer.trim();
          if (line.startsWith('data: ')) {
            response.write(`${line}\n\n`);
          }
        }

      } catch (streamError) {
        console.error('Erreur streaming:', streamError);
        response.write(`data: {"error": "Stream error"}\n\n`);
      }

      // Terminer le stream
      response.write('data: [DONE]\n\n');
      response.end();
      return;

    } else {
      return sendJson(response, 400, { error: 'Type de requête invalide.' });
    }

  } catch (error) {
    console.error('Erreur dans la fonction proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur interne du serveur est survenue.';
    if (!response.headersSent) {
      return sendJson(response, 500, { error: errorMessage });
    }
  }
}