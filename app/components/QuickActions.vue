<script setup lang="ts">
import {
  BarChart3,
  FileText,
  LucideLayoutDashboard,
  Repeat,
  Utensils,
} from "lucide-vue-next";
import { useRoute } from "#imports";

const route = useRoute();

</script>

<template>
  <div class="bg-white dark:bg-gray-600 rounded-xl shadow p-6 mb-4">
    <!-- <h3 class="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3> -->
    <div
      class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <!-- Back to Home (shown on other pages) -->
      <NuxtLink
        to="/"
        class="flex flex-col items-center p-4 ring-2 ring-red-300 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
        :class="{ 'ring-4 bg-red-100 ring-red-500': route.path === '/' }"
      >
        <LucideLayoutDashboard class="w-6 h-6 text-red-600 mb-2" />
        <span class="text-xs sm:text-sm font-medium text-red-700 text-center"
          >Dashboard</span
        >
      </NuxtLink>

      <!-- Transactions -->
      <NuxtLink
        to="/transactions"
        class="flex flex-col items-center p-4 ring-2 ring-blue-300 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
        :class="{ 'ring-4 bg-blue-100 ring-blue-500': route.path === '/transactions' }"
      >
        <Repeat class="w-6 h-6 text-blue-600 mb-2" />
        <span class="text-xs sm:text-sm font-medium text-blue-700 text-center"
          >Transactions</span
        >
      </NuxtLink>

      <!-- Categories -->
      <NuxtLink
        to="/categories"
        class="flex flex-col items-center p-4 ring-2 ring-orange-300 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
        :class="{ 'ring-4 bg-orange-100 ring-orange-500': route.path === '/categories' }"
      >
        <Utensils class="w-6 h-6 text-orange-600 mb-2" />
        <span class="text-xs sm:text-sm font-medium text-orange-700 text-center"
          >Categories</span
        >
      </NuxtLink>

      <!-- Analytics -->
      <NuxtLink
        to="/analytics"
        class="flex flex-col items-center p-4 ring-2 ring-green-300 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
        :class="{ 'ring-4 bg-green-100 ring-green-500': route.path === '/analytics' }"
      >
        <BarChart3 class="w-6 h-6 text-green-600 mb-2" />
        <span class="text-xs sm:text-sm font-medium text-green-700 text-center"
          >Analytics</span
        >
      </NuxtLink>

      <!-- Reports -->
      <NuxtLink
        to="/reports"
        class="flex flex-col items-center p-4 ring-2 ring-purple-300 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
        :class="{ 'ring-4 bg-purple-100 ring-purple-500': route.path === '/reports' }"
      >
        <FileText class="w-6 h-6 text-purple-600 mb-2" />
        <span class="text-xs sm:text-sm font-medium text-purple-700 text-center"
          >Reports</span
        >
      </NuxtLink>
    </div>
  </div>
</template>
