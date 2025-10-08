<script setup lang="ts">
import { formatCurrency } from "~/utils/utils";
defineProps<{
  topCategories: any[];
  filteredExpense: number;
}>();
</script>

<template>
  <div
    v-if="topCategories.length > 0"
    class="bg-white rounded-xl shadow p-4 sm:p-6"
  >
    <h3 class="text-lg font-semibold mb-4 text-gray-800">
      Top Spending Categories
    </h3>
    <div class="space-y-4">
      <div
        v-for="([category, amount], index) in topCategories"
        :key="category"
        class="flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <!-- Category Name with Rank -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <div
            class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <span class="text-sm font-semibold text-blue-600">
              {{ index + 1 }}
            </span>
          </div>
          <span class="font-medium text-gray-800 truncate">{{ category }}</span>
        </div>

        <!-- Progress Bar and Stats -->
        <div class="flex items-center gap-3 sm:gap-4 flex-1 sm:justify-end">
          <!-- Progress Bar -->
          <div class="flex-1 sm:w-32 md:w-48 bg-gray-200 rounded-full h-2">
            <div
              class="bg-red-500 h-2 rounded-full transition-all duration-300"
              :style="{
                width: `${(amount / filteredExpense) * 100}%`,
              }"
            ></div>
          </div>

          <!-- Amount and Percentage -->
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span
              class="font-semibold text-red-600 text-sm sm:text-base w-16 sm:w-20 text-right"
            >
              ${{ amount.toFixed(2) }}
            </span>
            <span
              class="text-xs sm:text-sm text-gray-500 w-10 sm:w-12 text-right"
            >
              {{ ((amount / filteredExpense) * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
