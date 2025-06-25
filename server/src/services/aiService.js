import { Mistral } from '@mistralai/mistralai';
import config from '../config/config.js';
import logger from '../config/logger.js';

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

  const systemPrompt = `Vous êtes un assistant expert en gestion de tâches. Votre rôle est de décomposer une demande de l'utilisateur en une liste de sous-tâches claires et concises. Répondez uniquement avec la liste des tâches, chaque tâche sur une nouvelle ligne. N'ajoutez aucune introduction, explication ou formatage supplémentaire (pas de tirets, de numéros, etc.). Par exemple, si l'utilisateur demande "Organiser une fête d'anniversaire", vous pourriez répondre:
Trouver une date
Établir la liste des invités
Choisir un lieu
Envoyer les invitations
Préparer le gâteau
Acheter les boissons
Décorer la salle`;

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

export default {
  generateToDoList,
};
