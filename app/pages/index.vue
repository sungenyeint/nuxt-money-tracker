<script setup lang="ts">
import DashboardCards from "~/components/DashboardCards.vue";
import QuickActions from "~/components/QuickActions.vue";
import BudgetStatus from "~/components/BudgetStatus.vue";
import MonthlyTrend from "~/components/MonthlyTrend.vue";
import TopSpendingCategories from "~/components/TopSpendingCategories.vue";
import RecentTransactions from "~/components/RecentTransactions.vue";
import { useDashboardStats } from "~/composables/useDashboardStats";
import { useTransactions } from "~/composables/useTransactions";
import { useSettings } from "~/composables/useSettings";

const { budgetStatus, monthlyTrend, topCategories, recentTransactions } =
  useDashboardStats();
const { income, expense, balance } = useTransactions();
const { userSettings } = useSettings();
</script>
<template>
  <div class="space-y-6">
    <!-- Budget Status -->
    <BudgetStatus
      :spent="budgetStatus.spent"
      :monthlyBudget="budgetStatus.budget"
      :percentage="budgetStatus.percentage"
      :currency="userSettings.currency"
    />
    <!-- Monthly Trend -->
    <MonthlyTrend :trend="monthlyTrend" :currency="userSettings.currency" />
    <!-- Top Spending Categories -->
    <TopSpendingCategories :topCategories="topCategories" :filteredExpense="expense" />
    <!-- Recent Transactions -->
    <RecentTransactions :recentTransactions="recentTransactions" />
  </div>
</template>
