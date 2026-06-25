interface AuthUser {
  username: string
  user_id: string
}

interface AuthResponse {
  username: string
  message: string
}

interface ProfileResponse {
  username: string
  user_id: string
  token: string
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const api = config.public.apiUrl

  const user = useState<AuthUser | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = useState<boolean>('auth-loading', () => false)

  const fetchUser = async (): Promise<boolean> => {
    try {
      const data = await $fetch<ProfileResponse>(`${api}/auth/me`, {
        credentials: 'include'
      })
      user.value = {
        username: data.username,
        user_id: data.user_id
      }
      return true
    } catch {
      user.value = null
      return false
    }
  }

  const login = async (username: string, password: string): Promise<{ success: boolean, error?: string }> => {
    isLoading.value = true
    try {
      await $fetch<AuthResponse>(`${api}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        body: { username, password }
      })

      await fetchUser()
      return { success: true }
    } catch (err: unknown) {
      const message = (err as { data?: string })?.data || 'Login failed'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (username: string, password: string): Promise<{ success: boolean, error?: string }> => {
    isLoading.value = true
    try {
      await $fetch<AuthResponse>(`${api}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        body: { username, password }
      })
      await fetchUser()
      return { success: true }
    } catch (err: unknown) {
      const message = (err as { data?: string })?.data || 'Registration failed'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await $fetch(`${api}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch {
      // Even if the server call fails, clear client state
    }
    user.value = null
    navigateTo('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    fetchUser,
    login,
    register,
    logout
  }
}
