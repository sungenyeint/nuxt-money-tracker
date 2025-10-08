<script setup lang="ts">
import { Filter, X } from "lucide-vue-next";
import { computed } from "vue";

interface FilterState {
  search: string;
  typeFilter: "all" | "income" | "expense";
  categoryFilter: string;
  dateFrom: string;
  dateTo: string;
}

const props = defineProps<{
  filters: FilterState;
  categories: any[];
  showFilters: boolean;
}>();

const emit = defineEmits<{
  "update:filters": [filters: FilterState];
  "update:showFilters": [show: boolean];
  clearFilters: [];
}>();

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    props.filters.typeFilter !== "all" ||
    props.filters.categoryFilter !== "all" ||
    props.filters.dateFrom !== "" ||
    props.filters.dateTo !== ""
  );
});

// Active filter count
const activeFilterCount = computed(() => {
  return [
    props.filters.typeFilter !== "all",
    props.filters.categoryFilter !== "all",
    props.filters.dateFrom,
    props.filters.dateTo,
  ].filter(Boolean).length;
});

// Update individual filter
const updateFilter = (key: keyof FilterState, value: any) => {
  emit("update:filters", { ...props.filters, [key]: value });
};

// Toggle filters panel
const toggleFilters = () => {
  emit("update:showFilters", !props.showFilters);
};

// Clear all filters
const clearAllFilters = () => {
  emit("clearFilters");
};

// Clear individual filter
const clearFilter = (key: keyof FilterState, defaultValue: any = "all") => {
  updateFilter(key, defaultValue);
};
</script>

<template>
  <div class="space-y-4">
    <!-- Search and Buttons Row -->
    <div class="flex items-center gap-4">
      <input
        :value="filters.search"
        @input="
          updateFilter('search', ($event.target as HTMLInputElement).value)
        "
        type="text"
        placeholder="Search by description, category, or amount..."
        class="border rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />
      <button
        @click="toggleFilters"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
          hasActiveFilters
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        ]"
      >
        <Filter class="w-4 h-4" />
        Filters
        <span
          v-if="hasActiveFilters"
          class="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
        >
          {{ activeFilterCount }}
        </span>
      </button>
      <slot name="actions"></slot>
    </div>

    <!-- Filter Panel -->
    <div
      v-if="showFilters"
      class="bg-white border rounded-lg p-4 shadow-sm space-y-4"
    >
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-semibold text-gray-800">Filter Transactions</h3>
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <X class="w-4 h-4" />
          Clear All
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            :value="filters.typeFilter"
            @change="
              updateFilter(
                'typeFilter',
                ($event.target as HTMLSelectElement).value
              )
            "
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            :value="filters.categoryFilter"
            @change="
              updateFilter(
                'categoryFilter',
                ($event.target as HTMLSelectElement).value
              )
            "
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.name"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Date From -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            :value="filters.dateFrom"
            @input="
              updateFilter(
                'dateFrom',
                ($event.target as HTMLInputElement).value
              )
            "
            type="date"
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        <!-- Date To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            :value="filters.dateTo"
            @input="
              updateFilter('dateTo', ($event.target as HTMLInputElement).value)
            "
            type="date"
            class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2">
        <span
          v-if="filters.typeFilter !== 'all'"
          class="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
        >
          Type: {{ filters.typeFilter }}
          <button
            @click="clearFilter('typeFilter', 'all')"
            class="hover:text-blue-900"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
        <span
          v-if="filters.categoryFilter !== 'all'"
          class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
        >
          Category: {{ filters.categoryFilter }}
          <button
            @click="clearFilter('categoryFilter', 'all')"
            class="hover:text-green-900"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
        <span
          v-if="filters.dateFrom"
          class="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
        >
          From: {{ new Date(filters.dateFrom).toLocaleDateString() }}
          <button
            @click="clearFilter('dateFrom', '')"
            class="hover:text-purple-900"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
        <span
          v-if="filters.dateTo"
          class="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
        >
          To: {{ new Date(filters.dateTo).toLocaleDateString() }}
          <button
            @click="clearFilter('dateTo', '')"
            class="hover:text-orange-900"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>
