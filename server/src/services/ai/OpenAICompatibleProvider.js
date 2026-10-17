import OpenAI from 'openai';
import logger from '../../config/logger.js';
import AIProvider from './AIProvider.js';

/**
 * Provider pour toute API compatible OpenAI (OpenAI, Mistral, OpenRouter, Ollama Cloud...).
 */
export default class OpenAICompatibleProvider extends AIProvider {
  constructor({ name, apiKey, baseURL, model }) {
    super();
    this.name = name;
    this.model = model;
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async complete(messages) {
    logger.debug(
      `[IA] Requête ${this.name} -> ${this.client.baseURL} (modèle ${this.model}), messages: ${JSON.stringify(messages)}`,
    );
    const startedAt = Date.now();
    let response;
    try {
      response = await this.client.chat.completions.create({
        model: this.model,
        messages,
      });
    } catch (error) {
      logger.error(
        `[IA] Échec ${this.name} après ${Date.now() - startedAt}ms: status=${error.status} message=${error.message} body=${JSON.stringify(error.error)}`,
      );
      throw error;
    }
    logger.debug(
      `[IA] Réponse ${this.name} en ${Date.now() - startedAt}ms: ${JSON.stringify(response)}`,
    );
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`Réponse invalide ou vide de l'API ${this.name}.`);
    }
    return content;
  }
}
