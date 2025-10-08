import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { user, authLoading } = useAuth()

  console.log('Auth Middleware - Loading:', authLoading.value, 'User:', user.value)
  
  // Allow access to public routes
  const publicRoutes = ['/login', '/register', '/']
  if (publicRoutes.includes(to.path)) return

  // Wait for auth to finish loading
  if (authLoading.value) {
    // Still loading, don't redirect yet
    return
  }

  // If not authenticated after loading, redirect to login
  if (!user.value) {
    console.log('Auth Middleware - Redirecting to login')
    return navigateTo('/login')
  }
})