<script setup>
import { login, logout } from "~/composables/useFirebase"
import { useAuth } from "~/composables/useAuth"

const { user } = useAuth()
</script>

<template>
  <div>
    <button v-if="!user" @click="login">Sign in with Google</button>
    <div v-else>
      <p>Welcome, {{ user.displayName }}</p>
      <button @click="logout">Logout</button>
    </div>
  </div>
</template>
