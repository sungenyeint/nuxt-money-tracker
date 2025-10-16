<script setup lang="ts">
import { computed } from "vue";
import { useTransactions } from "~/composables/useTransactions";
import { useSettings } from "~/composables/useSettings";
import QuickActions from "~/components/QuickActions.vue";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import DashboardCards from "~/components/DashboardCards.vue";
import { useTheme } from "~/composables/useTheme";

useTheme();

const { userSettings } = useSettings();
const { income, expense, balance } = useTransactions();

const currency = computed(() => userSettings.value.currency);
</script>

<template>
    <div class="min-h-screen dark:text-gray-100 text-gray-800">
        <div class="max-w-7xl mx-auto">
            <AppHeader />
            <div class="max-w-6xl mx-auto px-6 sm:px-0">
                <DashboardCards :balance="balance" :income="income" :expense="expense" :currency="currency"
                    class="mb-4" />
                <QuickActions />
                <slot />
            </div>
            <AppFooter />
        </div>
    </div>
</template>
