// Ce fichier est une fonction "serverless" Vercel.
// Il reçoit les requêtes de l'application, appelle l'API Groq en utilisant
// la clé API secrète stockée dans les variables d'environnement de Vercel,
// et renvoie la réponse à l'application.
// La clé API n'est jamais exposée au navigateur.

// Une fonction d'aide pour envoyer des réponses JSON de manière cohérente
const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data);
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
      const { text, langName } = payload;
      if (!text || !langName) {
        return sendJson(response, 400, { error: 'Le texte ou la langue pour la traduction est manquant.' });
      }
      const messages = [
        { role: "system", content: `You are a translation assistant. Translate the user's text from French to ${langName}. Provide only the direct translation, without any extra phrases or explanations.` },
        { role: "user", content: text }
      ];

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model, stream: true })
      });

      if (!groqResponse.ok) {
        const errorBody = await groqResponse.text();
        console.error('Erreur API Groq (translate):', errorBody);
        return sendJson(response, groqResponse.status, { error: `L'API Groq a répondu avec le statut ${groqResponse.status}` });
      }

      response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');

      const stream = groqResponse.body;
      for await (const chunk of stream) {
        response.write(chunk);
      }
      response.end();
      return; // Fin du gestionnaire, le flux a été géré

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
