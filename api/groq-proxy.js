// Ce fichier est une fonction "serverless" Vercel.
// Il reçoit les requêtes de l'application, appelle l'API Groq en utilisant
// la clé API secrète stockée dans les variables d'environnement de Vercel,
// et renvoie la réponse à l'application.
// La clé API n'est jamais exposée au navigateur.

module.exports = async (request, response) => {
  // Accepter uniquement les requêtes POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  // Vérifier si la clé API est configurée sur le serveur Vercel
  if (!groqApiKey) {
    return response.status(500).json({ error: 'La variable d\'environnement GROQ_API_KEY n\'est pas configurée sur le serveur.' });
  }

  try {
    const { type, payload } = request.body;
    let messages;

    // Déterminer les messages à envoyer à Groq en fonction du type de requête
    if (type === 'summarize') {
      const { text } = payload;
      if (!text) {
        return response.status(400).json({ error: 'Le texte pour le résumé est manquant.' });
      }
      messages = [
        { role: "system", content: "Tu es un assistant expert en pneumologie. Ton rôle est de résumer des transcriptions de conférences de manière concise et claire, en structurant le résumé en quelques points clés importants sur des lignes séparées." },
        { role: "user", content: `Voici la transcription:\n\n"${text}"` }
      ];
    } else if (type === 'translate') {
      const { text, langName } = payload;
      if (!text || !langName) {
        return response.status(400).json({ error: 'Le texte ou la langue pour la traduction est manquant.' });
      }
      messages = [
        { role: "system", content: `You are a translation assistant. Translate the user's text from French to ${langName}. Provide only the direct translation, without any extra phrases or explanations.` },
        { role: "user", content: text }
      ];
    } else {
      return response.status(400).json({ error: 'Type de requête invalide.' });
    }

    // Appeler l'API Groq directement avec fetch
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
        model: "llama3-8b-8192"
      })
    });

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text();
      console.error('Erreur API Groq:', errorBody);
      throw new Error(`L'API Groq a répondu avec le statut ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const resultText = groqData.choices[0]?.message?.content || null;

    if (resultText) {
      return response.status(200).json({ result: resultText });
    } else {
      return response.status(500).json({ error: 'Impossible d\'obtenir une réponse valide de l\'API Groq.' });
    }

  } catch (error) {
    console.error('Erreur lors du proxy vers Groq:', error);
    return response.status(500).json({ error: 'Une erreur interne du serveur est survenue.' });
  }
};
