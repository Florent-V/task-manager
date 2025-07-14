import aiService from '../services/aiService.js';
import logger from '../config/logger.js';

export async function generateToDoList(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Le prompt est requis.' });
  }

  try {
    const tasks = await aiService.generateToDoList(prompt);
    res.json(tasks);
  } catch (error) {
    logger.error(`Erreur API /ai/generate-todolist: ${error.message}`, { prompt });
    // Masquer les détails de l'erreur au client pour des raisons de sécurité
    res
      .status(500)
      .json({ message: 'Une erreur est survenue lors de la génération de la liste de tâches.' });
  }
}
