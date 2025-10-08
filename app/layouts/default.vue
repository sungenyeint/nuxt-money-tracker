<script setup lang="ts">
import { useTransactions } from "~/composables/useTransactions";
const { income, expense, balance } = useTransactions();
</script>

<template>
    <div class="min-h-screen bg-gray-100">
      <div class="max-w-6xl mx-auto px-6">
        <AppHeader />
        <QuickActions />
        <SummaryCard :balance="balance" :income="income" :expense="expense" class="mb-4"/>
        <slot />
        <AppFooter />
      </div>
    </div>
</template>
