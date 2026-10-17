/**
 * Interface (stratégie) commune à tous les providers IA.
 */
export default class AIProvider {
  /**
   * @param {{role: 'system'|'user'|'assistant', content: string}[]} messages
   * @returns {Promise<string>} Le texte de la réponse.
   */
  // eslint-disable-next-line no-unused-vars
  async complete(messages) {
    throw new Error('complete() doit être implémentée par le provider.');
  }
}
