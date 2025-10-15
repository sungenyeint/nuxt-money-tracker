<script setup lang="ts">
import { Heart } from "lucide-vue-next";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-white dark:bg-gray-800 dark:text-gray-100 shadow-sm mt-6">
    <!-- Bottom Bar -->
    <div class="max-w-7xl mx-auto px-6 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-sm">
          © {{ currentYear }} MoneyTracker. All rights reserved.
        </p>
        <div class="flex items-center gap-1 text-sm">
          <span>Made with</span>
          <Heart class="w-4 h-4 text-red-500 fill-current" />
          <span>by Your Team</span>
        </div>
      </div>
    </div>
  </footer>
</template>
