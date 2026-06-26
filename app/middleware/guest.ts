export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, fetchUser } = useAuth()

  // try to auth
  if (!isAuthenticated.value) {
    await fetchUser()
  }

  // Already logged in — redirect away from auth pages
  if (isAuthenticated.value) {
    return navigateTo('/chat')
  }
})
