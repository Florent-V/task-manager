// TODO notifications
import { defineStore } from 'pinia'

import { useToast } from '@/composables/useToast'

export const useNotificationStore = defineStore('notifications', () => {
  const toast = useToast()

  const notifySuccess = (message) => {
    toast.showSuccess(message)
  }

  const notifyError = (error) => {
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue'
    toast.showError(message)
  }

  const notifyApiError = (error) => {
    if (error.response?.status === 401) {
      toast.showError('Session expirée, veuillez vous reconnecter')
    } else if (error.response?.status >= 500) {
      toast.showError('Erreur serveur, veuillez réessayer plus tard')
    } else {
      notifyError(error)
    }
  }

  return {
    notifySuccess,
    notifyError,
    notifyApiError
  }
})