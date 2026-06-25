export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, fetchUser } = useAuth()

  // If we don't have user state yet, try to hydrate from the cookie
  if (!isAuthenticated.value) {
    await fetchUser()
  }

  // Already logged in — redirect away from auth pages
  if (isAuthenticated.value) {
    return navigateTo('/chat')
  }
})
