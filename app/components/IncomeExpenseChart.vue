<template>
    <div class="bg-white rounded-xl shadow p-4">
        <h3 class="text-lg font-semibold mb-2">Income vs Expense</h3>
        <LineChart :chartData="chartData" :options="chartOptions" style="height:300px;" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LineChart } from 'vue-chart-3'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js'
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale)

const props = defineProps<{ transactions: any[] }>()

// Prepare monthly data
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const monthlyData = computed(() => {
    const income = Array(12).fill(0)
    const expense = Array(12).fill(0)
    props.transactions.forEach(t => {
        const date = new Date(t.date)
        const month = date.getMonth()
        if (t.type === 'income') income[month] += t.amount
        if (t.type === 'expense') expense[month] += t.amount
    })
    return { income, expense }
})

const chartData = computed(() => ({
    labels: months,
    datasets: [
        {
            label: 'Income',
            data: monthlyData.value.income,
            borderColor: '#34d399',
            backgroundColor: 'rgba(52, 211, 153, 0.2)',
            tension: 0.4,
            fill: true
        },
        {
            label: 'Expense',
            data: monthlyData.value.expense,
            borderColor: '#f87171',
            backgroundColor: 'rgba(248, 113, 113, 0.2)',
            tension: 0.4,
            fill: true
        }
    ]
}))

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' },
        title: { display: false }
    },
    scales: {
        y: { beginAtZero: true }
    }
}
</script>
