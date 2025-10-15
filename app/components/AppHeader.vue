<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "#imports";
import { ChevronDown, LogOut, Settings } from "lucide-vue-next";

const { user, signout } = useAuth();
const router = useRouter();

const dropdownOpen = ref(false);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const logout = async () => {
  closeDropdown();
  if (confirm("Are you sure want to logout?")) {
    await signout();
    router.push("/login");
  }
};

const goToSettings = () => {
  closeDropdown();
  router.push("/setting");
};

</script>

<template>
  <header class="bg-white sticky top-0 z-50 shadow-sm mb-4 dark:bg-gray-800 dark:text-gray-100">
    <div class="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <NuxtLink
          to="/"
          class="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo.webp"
            alt="MoneyTracker Logo"
            class="w-14 object-contain"
            @error="(e) => (e.target.style.display = 'none')"
          />
          <div class="flex flex-col">
            <h1 class="text-xl font-bold text-gray-900 leading-tight dark:text-white">
              MoneyTracker
            </h1>
            <p class="text-xs text-gray-500 hidden sm:block dark:text-white">
              Track your finances
            </p>
          </div>
        </NuxtLink>

        <!-- User Menu -->
        <div v-if="user" class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200"
          >
            <!-- User Avatar -->
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
            >
              {{ user?.displayName ? user.displayName[0].toUpperCase() : "U" }}
            </div>
            <!-- User Email (hidden on mobile) -->
            <span
              class="hidden md:block font-medium text-gray-700 dark:text-white text-sm max-w-[150px] truncate"
            >
              {{ user?.displayName || user?.email }}
            </span>
            <!-- Dropdown Icon -->
            <ChevronDown
              class="w-4 h-4 text-gray-500 dark:text-white transition-transform"
              :class="{ 'rotate-180': dropdownOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="dropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-600 border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            >
              <!-- User Info -->
              <div class="px-4 py-3 border-b border-gray-100 dark:bg-gray-600 bg-gray-50">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ user.email }}
                </p>
                <p class="text-xs text-gray-500 dark:text-white mt-1">Signed in</p>
              </div>

              <!-- Menu Items -->
              <div class="py-1">
                <button
                  @click="goToSettings"
                  class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-white dark:hover:bg-gray-400  hover:bg-gray-50 transition-colors"
                >
                  <Settings class="w-4 h-4 text-gray-500 dark:text-white" />
                  Settings
                </button>
                <button
                  @click="logout"
                  class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut class="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </Transition>

          <!-- Backdrop -->
          <div
            v-if="dropdownOpen"
            class="fixed inset-0 z-[-1]"
            @click="closeDropdown"
          ></div>
        </div>

        <!-- Login Button (if not logged in) -->
        <NuxtLink
          v-else
          to="/login"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
