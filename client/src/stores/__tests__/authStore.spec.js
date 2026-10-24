import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/authStore.js'
import { apiClient } from '@/services/requestMaker.js'

vi.mock('@/services/requestMaker.js', () => ({
  apiClient: { get: vi.fn() },
  apiBaseUrl: 'https://api.test'
}))

vi.mock('@/utils/logger.js', () => ({
  default: { debug: vi.fn(), error: vi.fn() }
}))

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts logged out and not loaded', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.loaded).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })

  it('setUser builds fullName and drives the getters', () => {
    const store = useAuthStore()
    store.setUser({ firstName: 'Ada', lastName: 'Lovelace', roles: ['ROLE_ADMIN'] })
    expect(store.user.fullName).toBe('Ada Lovelace')
    expect(store.isAuthenticated).toBe(true)
    expect(store.isAdmin).toBe(true)
  })

  it('isAdmin is false without ROLE_ADMIN', () => {
    const store = useAuthStore()
    store.setUser({ firstName: 'Bob', roles: ['ROLE_USER'] })
    expect(store.user.fullName).toBe('Bob')
    expect(store.isAdmin).toBe(false)
  })

  it('loadUser stores the user returned by the API', async () => {
    apiClient.get.mockResolvedValue({ data: { firstName: 'Ada', lastName: 'Lovelace' } })
    const store = useAuthStore()

    const user = await store.loadUser()

    expect(apiClient.get).toHaveBeenCalledWith('/api/auth/me', { withCredentials: true })
    expect(user.fullName).toBe('Ada Lovelace')
    expect(store.loaded).toBe(true)
  })

  it('loadUser clears the user on 401', async () => {
    apiClient.get.mockRejectedValue({ response: { status: 401 } })
    const store = useAuthStore()
    store.setUser({ firstName: 'Old' })

    const user = await store.loadUser()

    expect(user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.loaded).toBe(true)
  })

  it('logout clears the user and redirects to the API', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { assign })
    const store = useAuthStore()
    store.setUser({ firstName: 'Ada' })

    store.logout()

    expect(store.user).toBeNull()
    expect(assign).toHaveBeenCalledWith('https://api.test/api/auth/logout')
    vi.unstubAllGlobals()
  })

  it('login redirects with returnTo', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { assign })

    useAuthStore().login('/kanban/1')

    expect(assign).toHaveBeenCalledWith('https://api.test/api/auth/login?returnTo=%2Fkanban%2F1')
    vi.unstubAllGlobals()
  })
})
