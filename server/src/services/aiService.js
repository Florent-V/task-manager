import logger from '../config/logger.js';
import { getProvider } from './ai/providerFactory.js';
import { getPrompt } from './promptManager.js';

const TASK_TITLE_MAX_LENGTH = 50; // aligné sur toDoItemSchema
const TASK_TITLE_MIN_LENGTH = 2;

/**
 * Nettoie une ligne renvoyée par l'IA : retire puces/numéros et respecte les limites du schéma.
 */
function sanitizeTaskTitle(line) {
  const title = line
    .replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '')
    .replace(/\*\*/g, '')
    .trim();
  if (title.length <= TASK_TITLE_MAX_LENGTH) return title;
  const cut = title.slice(0, TASK_TITLE_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/**
 * Génère une liste de tâches à faire en utilisant l'API IA configurée.
 * @param {string} prompt Le prompt utilisateur décrivant la tâche ou le sujet.
 * @returns {Promise<string[]>} Une promesse qui se résout avec un tableau de chaînes de caractères représentant les tâches.
 * @throws {Error} Si l'appel à l'API échoue ou si la clé API n'est pas configurée.
 */
async function generateToDoList(prompt) {
  const systemPrompt = await getPrompt('generateToDoList');

  try {
    const content = await getProvider().complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]);
    // Séparer les tâches par saut de ligne et filtrer les lignes vides
    const tasks = content
      .split('\n')
      .map(sanitizeTaskTitle)
      .filter((task) => task.length >= TASK_TITLE_MIN_LENGTH);
    logger.debug(`[IA] generateToDoList: ${tasks.length} tâches: ${JSON.stringify(tasks)}`);
    return tasks;
  } catch (error) {
    logger.error("Erreur lors de l'appel à l'API IA:", error);
    throw new Error(`Erreur lors de la génération de la liste de tâches: ${error.message}`);
  }
}

/**
 * Organise une liste de tâches en catégories en utilisant l'API IA configurée.
 * @param {object[]} items Liste des items (id, title).
 * @returns {Promise<object[]>} Une promesse qui se résout avec un tableau d'objets {id, category}.
 */
async function organizeToDoList(items) {
  const systemPrompt = await getPrompt('organizeToDoList');

  try {
    let content = (
      await getProvider().complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(items) },
      ])
    ).trim();
    // Nettoyer d'éventuels blocs de code markdown
    if (content.startsWith('```json')) {
      content = content
        .replace(/^```json/, '')
        .replace(/```$/, '')
        .trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/^```/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(content);
  } catch (error) {
    logger.error("Erreur lors de l'organisation par l'IA:", error);
    throw new Error(`Erreur lors de l'organisation de la liste: ${error.message}`);
  }
}

export default {
  generateToDoList,
  organizeToDoList,
};
