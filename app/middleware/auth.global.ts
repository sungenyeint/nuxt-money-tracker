import { useAuth } from '~/composables/useAuth'
import { watch } from 'vue'

export default defineNuxtRouteMiddleware(async (to) => {
	const { user, authLoading } = useAuth()

	const publicRoutes = ['/login', '/register']

	// Wait for auth to finish loading before deciding
	if (authLoading.value) {
		await new Promise<void>((resolve) => {
			const stop = watch(authLoading, (isLoading) => {
				if (!isLoading) {
					stop()
					resolve()
				}
			})
		})
	}

	// If authenticated, prevent visiting auth pages
	if (user.value && (to.path === '/login' || to.path === '/register')) {
		return navigateTo('/')
	}

	// Allow access to public routes
	if (publicRoutes.includes(to.path)) return

	// If not authenticated after loading, redirect to login
	if (!user.value) {
		return navigateTo('/login')
	}
})
