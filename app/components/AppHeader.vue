<script setup lang="ts">
import { ref } from "vue"
import { useAuth } from "~/composables/useAuth"
import { useRouter } from "#imports"

const { user, signout } = useAuth()
const router = useRouter();

const dropdownOpen = ref(false)

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}
const closeDropdown = () => {
  dropdownOpen.value = false
}

const logout = async () => {
  closeDropdown();
  if (confirm("Are you sure want to logout?")) {
    await signout();
    router.push("/login");
  }
};
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-0 p-6 bg-gray-50 rounded-lg shadow">
    <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
      <div class="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white text-xl font-bold">
        💰
      </div>
      <div>
        <h1 class="text-2xl font-bold">MoneyTracker</h1>
      </div>
    </div>
    <div v-if="user" class="relative w-full sm:w-auto flex justify-center sm:justify-end">
      <button @click="toggleDropdown" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 w-auto">
        <span class="font-medium truncate">{{ user.email }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
        <button @click="logout" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg">Logout</button>
      </div>
      <div v-if="dropdownOpen" class="fixed inset-0 z-0" @click="closeDropdown"></div>
    </div>
  </div>
</template>
