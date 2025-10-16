<script setup lang="ts">
import BudgetStatus from "~/components/BudgetStatus.vue";
import MonthlyTrend from "~/components/MonthlyTrend.vue";
import TopSpendingCategories from "~/components/TopSpendingCategories.vue";
import RecentTransactions from "~/components/RecentTransactions.vue";
import { useDashboardStats } from "~/composables/useDashboardStats";
import { useTransactions } from "~/composables/useTransactions";
import { useSettings } from "~/composables/useSettings";
import { computed } from "vue";
import { useRouter } from "#app";

const {
    budgetStatus,
    monthlyTrend,
    topCategories,
    recentTransactions
} = useDashboardStats();
const router = useRouter();
const { expense, transactions } = useTransactions();
const { userSettings } = useSettings();

const isFirstTime = computed(() => transactions.value.length === 0);

const goAddFirstTransaction = () => {
    router.push({ path: "/transactions", query: { add: "1" } });
};
</script>

<template>
    <div class="space-y-6">
        <!-- First-time user banner -->
        <div v-if="isFirstTime" class="rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4 sm:p-6 dark:bg-gray-700 dark:border-blue-400">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div class="flex-1">
                    <h3 class="text-base sm:text-lg font-semibold text-blue-800 dark:text-white">Welcome! Add your first transaction</h3>
                    <p class="text-sm text-blue-700/80 dark:text-gray-200 mt-1">Start tracking by adding an income or expense. You can edit or delete it anytime.</p>
                </div>
                <button @click="goAddFirstTransaction" class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                    + Add Transaction
                </button>
            </div>
        </div>
        <!-- Budget Status -->
        <BudgetStatus :spent="budgetStatus.spent" :monthlyBudget="budgetStatus.budget"
            :percentage="budgetStatus.percentage" :currency="userSettings.currency" />
        <!-- Monthly Trend -->
        <MonthlyTrend :trend="monthlyTrend" :currency="userSettings.currency" />
        <!-- Top Spending Categories -->
        <TopSpendingCategories :topCategories="topCategories" :filteredExpense="expense" :currency="userSettings.currency" />
        <!-- Recent Transactions -->
        <RecentTransactions :recentTransactions="recentTransactions" :currency="userSettings.currency" :format="userSettings.dateFormat" />
    </div>
</template>
