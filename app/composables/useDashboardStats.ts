// Extract all computed stats logic here
import { useTransactions } from "~/composables/useTransactions";
import { useSettings } from "~/composables/useSettings";
import { computed } from "vue";

export const useDashboardStats = () => {
  const { transactions } = useTransactions();
  const { userSettings } = useSettings();

  const budgetStatus = computed(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = transactions.value
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === "expense" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      spent: currentMonthExpenses,
      budget: userSettings.value.monthlyBudget,
      percentage:
        userSettings.value.monthlyBudget > 0
          ? (currentMonthExpenses / userSettings.value.monthlyBudget) * 100
          : 0,
    };
  });

  const monthlyTrend = computed(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = transactions.value
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === "expense" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const lastMonthExpenses = transactions.value
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.type === "expense" &&
          date.getMonth() === lastMonth &&
          date.getFullYear() === lastMonthYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (lastMonthExpenses === 0) return 0;
    return (
      ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    );
  });

  const recentTransactions = computed(() => transactions.value.slice(0, 5));

  const topCategories = computed(() => {
    const categoryTotals: Record<string, number> = {};
    transactions.value.forEach((t) => {
      if (t.type === "expense") {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  });

  return {
    budgetStatus,
    monthlyTrend,
    topCategories,
    recentTransactions,
  };
};
