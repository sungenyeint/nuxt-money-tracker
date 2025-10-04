import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  // Allow access to login, register, and homepage
  if (to.path === '/login' || to.path === '/register' || to.path === '/') return
  // If not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
