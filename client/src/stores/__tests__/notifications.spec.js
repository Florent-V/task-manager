import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useNotificationStore } from '@/stores/notifications.js'

const showSuccess = vi.fn()
const showError = vi.fn()

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ showSuccess, showError })
}))

describe('notifications store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('notifySuccess shows a success toast', () => {
    useNotificationStore().notifySuccess('Saved')
    expect(showSuccess).toHaveBeenCalledWith('Saved')
  })

  it('notifyError prefers the API message', () => {
    const store = useNotificationStore()
    store.notifyError({ response: { data: { message: 'API message' } }, message: 'raw' })
    store.notifyError({ message: 'raw' })
    store.notifyError({})
    expect(showError.mock.calls.map(([message]) => message))
      .toEqual(['API message', 'raw', 'Une erreur est survenue'])
  })

  it('notifyApiError maps HTTP statuses', () => {
    const store = useNotificationStore()
    store.notifyApiError({ response: { status: 401 } })
    store.notifyApiError({ response: { status: 503 } })
    store.notifyApiError({ response: { status: 400, data: { message: 'Bad input' } } })
    expect(showError.mock.calls.map(([message]) => message)).toEqual([
      'Session expirée, veuillez vous reconnecter',
      'Erreur serveur, veuillez réessayer plus tard',
      'Bad input'
    ])
  })
})
