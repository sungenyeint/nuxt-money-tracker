import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
    const { user, authLoading } = useAuth()

    console.log('Auth Middleware - Loading:', authLoading.value, 'User:', user.value)

    const publicRoutes = ['/', '/login', '/register']

    // Wait for auth to finish loading before deciding
    if (authLoading.value) return

    // If authenticated, prevent visiting auth pages
    if (user.value && (to.path === '/login' || to.path === '/register')) {
        return navigateTo('/')
    }

    // Allow access to public routes
    if (publicRoutes.includes(to.path)) return

    // If not authenticated after loading, redirect to login
    if (!user.value) {
        console.log('Auth Middleware - Redirecting to login')
        return navigateTo('/login')
    }
})
