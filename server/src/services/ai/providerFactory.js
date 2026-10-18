import config from '../../config/config.js';
import logger from '../../config/logger.js';
import OpenAICompatibleProvider from './OpenAICompatibleProvider.js';

// Tous ces providers exposent une API compatible OpenAI : une seule classe suffit.
const PROVIDERS = {
  mistral: { baseURL: 'https://api.mistral.ai/v1', model: 'mistral-small-latest' },
  openai: { baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'mistralai/mistral-small-3.2-24b-instruct',
  },
  nvidia: {
    baseURL: 'https://integrate.api.nvidia.com/v1',
    model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: 'gemini-3.8-flash',
  },
  ollama: { baseURL: 'https://ollama.com/v1', model: 'gpt-oss:120b' }, // Ollama Cloud
};

let provider;

/**
 * Retourne le provider IA (singleton) selon AI_PROVIDER, AI_API_URL, AI_API_KEY, AI_MODEL.
 */
export function getProvider() {
  if (provider) return provider;

  const name = (config.ai.provider || 'mistral').toLowerCase();
  const defaults = PROVIDERS[name];
  if (!defaults) {
    throw new Error(
      `Provider IA inconnu "${name}". Valeurs possibles : ${Object.keys(PROVIDERS).join(', ')}.`
    );
  }
  if (!config.ai.apiKey) {
    throw new Error(`AI_API_KEY non configurée pour le provider "${name}".`);
  }

  provider = new OpenAICompatibleProvider({
    name,
    apiKey: config.ai.apiKey,
    baseURL: config.ai.apiUrl || defaults.baseURL,
    model: config.ai.model || defaults.model,
  });
  logger.info(`Provider IA : ${name} (modèle ${provider.model})`);
  return provider;
}
