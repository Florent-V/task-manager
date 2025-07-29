import { toast } from 'vue3-toastify'

import 'vue3-toastify/dist/index.css';
import { useTheme } from './useTheme'

export const useToast = () => {
  const { isDarkMode } = useTheme()
  // Configuration par défaut
  const defaultOptions = {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: isDarkMode.value ? 'dark' : 'light'
  }

  // Méthodes pour différents types de toasts
  const showSuccess = (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options })
  }

  const showError = (message, options = {}) => {
    toast.error(message, { ...defaultOptions, ...options })
  }

  const showWarning = (message, options = {}) => {
    toast.warning(message, { ...defaultOptions, ...options })
  }

  const showInfo = (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options })
  }

  // Toast de chargement
  const showLoading = (message = 'Chargement...') => {
    return toast.loading(message, {
      ...defaultOptions,
      autoClose: false
    })
  }

  // Mise à jour d'un toast existant
  const updateToast = (toastId, message, type = 'success') => {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000
    })
  }

  // Suppression d'un toast
  const dismiss = (toastId) => {
    if (toastId) {
      toast.remove(toastId)
    }
  }

  // Fermeture de tous les toasts
  const dismissAll = () => {
    toast.clearAll()
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateToast,
    dismiss,
    dismissAll
  }
}