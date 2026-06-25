import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, fetchUser } = useAuth()

  // If we don't have user state yet, try to hydrate from the cookie
  if (!isAuthenticated.value) {
    await fetchUser()
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
