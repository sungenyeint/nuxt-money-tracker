<script setup lang="ts">
definePageMeta({ layout: 'auth' })

import { ref, nextTick } from "vue"
import { useRouter } from "#imports"
import { useAuth } from "~/composables/useAuth"

const { signin, signInWithGoogle } = useAuth()
const email = ref("")
const password = ref("")
const router = useRouter()

async function login() {
  try {
    await signin(email.value, password.value)
    await nextTick()
    router.push("/")
  } catch (err: any) {
    alert(err.message)
  }
}

async function loginWithGoogle() {
  try {
    await signInWithGoogle()
    await nextTick()
    router.push("/")
  } catch (err: any) {
    alert(err.message)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div class="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
      <!-- Title -->
      <h1 class="text-2xl font-bold text-center">Money Tracker</h1>
      <p class="text-center text-gray-500 mb-6">Login</p>

      <!-- Email -->
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-300"
      />

      <!-- Password -->
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-300"
      />

      <!-- Login Button -->
      <button
        @click="login"
        class="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold hover:opacity-90 transition"
      >
        Login
      </button>

      <!-- Divider -->
      <div class="flex items-center my-6">
        <div class="flex-1 border-t border-gray-300"></div>
        <p class="px-3 text-gray-400 text-sm">or</p>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>

      <!-- Google Sign In -->
      <button
        @click="loginWithGoogle"
        class="w-full flex items-center justify-center border py-3 rounded-lg hover:bg-gray-50 transition"
      >
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
