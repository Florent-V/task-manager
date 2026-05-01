import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Charge un prompt depuis un fichier Markdown.
 * @param {string} promptName Le nom du fichier prompt sans extension.
 * @returns {Promise<string>} Le contenu du prompt.
 */
async function getPrompt(promptName) {
  const filePath = path.join(__dirname, '../prompts', `${promptName}.md`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.trim();
  } catch (error) {
    throw new Error(`Erreur lors du chargement du prompt ${promptName}: ${error.message}`);
  }
}

export { getPrompt };
