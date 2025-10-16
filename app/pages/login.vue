<script setup lang="ts">
definePageMeta({ layout: 'auth' })

import { ref } from "vue"
import { useRouter } from "#imports"
import { useAuth } from "~/composables/useAuth"

const { signin, signInWithGoogle } = useAuth()
const email = ref("")
const password = ref("")
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)
const router = useRouter()

const mapFirebaseError = (err: any): string => {
    const code = err?.code || "auth/unknown";

    switch (code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-disabled":
            return "This account has been disabled.";

        case "auth/user-not-found":
        case "auth/wrong-password":
            return "Invalid email or password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/popup-closed-by-user":
            return "Sign-in was canceled.";

        case "auth/invalid-credential":
            return "Your sign-in session has expired or the credentials are invalid. Please try again.";

        default:
            return err?.message || "Sign-in failed. Please try again.";
    }
};

async function login() {
    try {
        errorMessage.value = null
        isSubmitting.value = true
        await signin(email.value, password.value)
        router.push("/")
    } catch (err: any) {
        errorMessage.value = mapFirebaseError(err)
    }
    finally {
        isSubmitting.value = false
    }
}

async function loginWithGoogle() {
    try {
        errorMessage.value = null
        isSubmitting.value = true
        await signInWithGoogle()
        router.push("/")
    } catch (err: any) {
        errorMessage.value = mapFirebaseError(err)
    }
    finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div class="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
            <!-- Title -->
            <h1 class="text-2xl font-bold text-center">Money Tracker</h1>
            <p class="text-center text-gray-500 mb-6">Login</p>

            <!-- Error -->
            <div v-if="errorMessage"
                class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
                {{ errorMessage }}
            </div>

            <!-- Email -->
            <input v-model="email" type="email" placeholder="Email"
                class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-300" />

            <!-- Password -->
            <input v-model="password" type="password" placeholder="Password"
                class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-300" />

            <!-- Login Button -->
            <button :disabled="isSubmitting" @click="login"
                class="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed">
                {{ isSubmitting ? 'Signing in...' : 'Login' }}
            </button>

            <!-- Divider -->
            <div class="flex items-center my-6">
                <div class="flex-1 border-t border-gray-300"></div>
                <p class="px-3 text-gray-400 text-sm">or</p>
                <div class="flex-1 border-t border-gray-300"></div>
            </div>

            <!-- Google Sign In -->
            <button :disabled="isSubmitting" @click="loginWithGoogle"
                class="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5 mr-2" />
                Sign in with Google
            </button>

            <!-- Signup Link -->
            <p class="text-center text-sm text-gray-500 mt-6">
                Don’t have an account?
                <NuxtLink to="/register" class="text-blue-600 font-medium hover:underline">Sign Up</NuxtLink>
            </p>
        </div>
    </div>
</template>
