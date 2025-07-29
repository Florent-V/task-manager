/**
 * @class ToastManager
 * @description A class to manage the display of toast notifications.
 */
export class ToastManager {
  /**
   * @param {object} toastFunctions - The toast function handlers from useToast.
   * @param {{
   *    showToasts: boolean,
   *    loadingMessage: string,
   *    successMessage: string,
   *    errorMessage: string
   * }} options - Configuration options for the toasts.
   */
  constructor(toastFunctions, options) {
    this.toast = toastFunctions; // Utilise le composable useToast()
    this.options = options;
    this.toastId = null;
  }

  /**
   * @description Shows a loading toast.
   * @returns {ToastManager} - The instance for chaining.
   */
  showLoading() {
    if (this.options.showToasts) {
      this.toastId = this.toast.showLoading(this.options.loadingMessage);
    }
    return this;
  }

  /**
   * @description Updates the toast to a success message.
   * @returns {ToastManager} - The instance for chaining.
   */
  showSuccess() {
    if (this.options.showToasts && this.toastId) {
      this.toast.updateToast(this.toastId, this.options.successMessage, 'success');
    }
    return this;
  }

  /**
   * @description Updates the toast to an error message.
   * @returns {ToastManager} - The instance for chaining.
   */
  showError() {
    if (this.options.showToasts && this.toastId) {
      this.toast.updateToast(this.toastId, this.options.errorMessage, 'error');
    }
    return this;
  }
}