import { Mistral } from '@mistralai/mistralai';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { getPrompt } from './promptManager.js';

const apiKey = config.mistralApiKey;

if (!apiKey) {
  logger.warn('Clé API Mistral non configurée. Le service IA ne fonctionnera pas.');
}

const client = new Mistral({ apiKey: apiKey });

/**
 * Génère une liste de tâches à faire en utilisant l'API Mistral.
 * @param {string} prompt Le prompt utilisateur décrivant la tâche ou le sujet.
 * @returns {Promise<string[]>} Une promesse qui se résout avec un tableau de chaînes de caractères représentant les tâches.
 * @throws {Error} Si l'appel à l'API échoue ou si la clé API n'est pas configurée.
 */
async function generateToDoList(prompt) {
  if (!client) {
    throw new Error('Client Mistral non initialisé. Vérifiez la configuration de la clé API.');
  }

  const systemPrompt = await getPrompt('generateToDoList');

  try {
    const chatResponse = await client.chat.complete({
      model: 'mistral-small-latest', // ou un autre modèle approprié
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    if (chatResponse.choices && chatResponse.choices.length > 0) {
      const content = chatResponse.choices[0].message.content;
      // Séparer les tâches par saut de ligne et filtrer les lignes vides
      return content
        .split('\n')
        .map((task) => task.trim())
        .filter((task) => task.length > 0);
    } else {
      logger.error("Réponse inattendue de l'API Mistral:", chatResponse);
      throw new Error("Réponse invalide ou vide de l'API Mistral.");
    }
  } catch (error) {
    logger.error("Erreur lors de l'appel à l'API Mistral:", error);
    throw new Error(`Erreur lors de la génération de la liste de tâches: ${error.message}`);
  }
}

/**
 * Organise une liste de tâches en catégories en utilisant l'API Mistral.
 * @param {object[]} items Liste des items (id, title).
 * @returns {Promise<object[]>} Une promesse qui se résout avec un tableau d'objets {id, category}.
 */
async function organizeToDoList(items) {
  if (!client) {
    throw new Error('Client Mistral non initialisé. Vérifiez la configuration de la clé API.');
  }

  const systemPrompt = await getPrompt('organizeToDoList');

  try {
    const chatResponse = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(items) },
      ],
    });

    if (chatResponse.choices && chatResponse.choices.length > 0) {
      let content = chatResponse.choices[0].message.content.trim();
      // Nettoyer d'éventuels blocs de code markdown
      if (content.startsWith('```json')) {
        content = content
          .replace(/^```json/, '')
          .replace(/```$/, '')
          .trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '').trim();
      }
      console.log(JSON.stringify(content, null, 2));
      return JSON.parse(content);
    } else {
      throw new Error("Réponse invalide de l'API Mistral.");
    }
  } catch (error) {
    logger.error("Erreur lors de l'organisation par l'IA:", error);
    throw new Error(`Erreur lors de l'organisation de la liste: ${error.message}`);
  }
}

export default {
  generateToDoList,
  organizeToDoList,
};
