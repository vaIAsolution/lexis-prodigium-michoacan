import { GoogleGenerativeAI } from '@google/generative-ai';
import { PROMPTS } from './prompts.js';
import { ERROR_MESSAGES } from './errorMessages.js';

// --- Corpus Legal Estratégico de Michoacán (para demo RAG) ---
const sanLuisPotosiLegalCorpus = [
  // ... (el corpus legal se mantiene igual)
];

function retrieveRelevantContext(query, corpus, numResults = 3) {
  // ... (la función de recuperación de contexto se mantiene igual)
}

export default async (req, res) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error('GEMINI_API_KEY no está configurada.');
      return res.status(500).json({ error: ERROR_MESSAGES.API_KEY_MISSING });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
    }

    const { type, query, context } = req.body;
    if (!type || !query) {
      return res.status(400).json({ error: ERROR_MESSAGES.QUERY_REQUIRED });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let finalPrompt;

    // --- LÓGICA DE ENRUTAMIENTO A "MODOS COGNITIVOS" DE ÉLITE ---
    switch (type) {
      case 'contratos':
        finalPrompt = PROMPTS.ANALISIS_RIESGO_CONTRACTUAL(query);
        break;

      case 'strategy':
        finalPrompt = PROMPTS.ANALISIS_ESTRATEGIA_LEGAL(query);
        break;

      case 'document':
        // Para el generador de escritos, el 'query' es el tipo de documento y el 'context' son los detalles.
        finalPrompt = PROMPTS.GENERADOR_ESCRITOS_LEGALES(query, context);
        break;

      case 'perfiles':
        finalPrompt = PROMPTS.PERFILADOR_ACTOR_LEGAL(query);
        break;

      default:
        // Fallback para cualquier tipo no reconocido
        return res.status(400).json({ error: 'Tipo de solicitud no válida.' });
    }

    console.log(`[${new Date().toISOString()}] POST /api/proxy - Modo Cognitivo: ${type} - Llamando al modelo de IA.`);

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    console.log(`[${new Date().toISOString()}] POST /api/proxy - Respuesta exitosa de IA enviada al cliente.`);
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ERROR GENERAL:`, error);
    res.status(500).json({ error: ERROR_MESSAGES.AI_COMMUNICATION_ERROR(error.message || 'Error desconocido') });
  }
};