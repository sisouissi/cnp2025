// This file is a Vercel serverless function.
// It receives requests from the app, calls the Google Gemini API using
// the secret API key stored in Vercel environment variables,
// and returns the response to the app.
// The API key is never exposed to the browser.
import { GoogleGenAI } from "@google/genai";

// A helper function to send JSON responses consistently
const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data);
};

// Using default export for ES Modules compatibility
export default async function handler(request, response) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return sendJson(response, 405, { error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.API_KEY; // As per Gemini guidelines

    // Check if the API key is configured on the Vercel server
    if (!apiKey) {
      console.error('The API_KEY environment variable is not set on the server.');
      return sendJson(response, 500, { error: "Server configuration is incomplete." });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const { type, payload } = body || {};

    if (!type || !payload) {
      return sendJson(response, 400, { error: 'Malformed request. Type or payload is missing.' });
    }

    if (type === 'summarize') {
      const { text } = payload;
      if (!text) {
        return sendJson(response, 400, { error: 'Text for summary is missing.' });
      }
      
      const systemInstruction = "Tu es un assistant expert en pneumologie. Ton rôle est de résumer des transcriptions de conférences de manière concise et claire, en structurant le résumé en quelques points clés importants sur des lignes séparées.";
      const userContent = `Voici la transcription:\n\n"${text}"`;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userContent,
        config: { systemInstruction }
      });
      
      const resultText = result.text;

      if (resultText) {
        return sendJson(response, 200, { result: resultText });
      } else {
        return sendJson(response, 500, { error: "The Gemini API response was empty or malformed." });
      }

    } else if (type === 'translate') {
      const { text, langName } = payload;
      if (!text || !langName) {
        return sendJson(response, 400, { error: 'Text or language for translation is missing.' });
      }
      
      const systemInstruction = `You are a translation assistant. Translate the user's text from French to ${langName}. Provide only the direct translation, without any extra phrases or explanations.`;

      const streamResult = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: text,
        config: { 
          systemInstruction,
          thinkingConfig: { thinkingBudget: 0 } 
        }
      });

      response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');

      for await (const chunk of streamResult) {
        const textChunk = chunk.text;
        if (textChunk) {
          const sseChunk = {
            choices: [{ delta: { content: textChunk } }]
          };
          response.write(`data: ${JSON.stringify(sseChunk)}\n\n`);
        }
      }
      
      response.write('data: [DONE]\n\n');
      response.end();
      return; // End handler, stream has been handled

    } else {
      return sendJson(response, 400, { error: 'Invalid request type.' });
    }

  } catch (error) {
    console.error('Error in proxy function:', error);
    // Ensure we always send a JSON error response
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    if (!response.headersSent) {
      return sendJson(response, 500, { error: errorMessage });
    }
  }
}