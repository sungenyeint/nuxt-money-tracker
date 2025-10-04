<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(PieController, ArcElement, Tooltip, Legend)

const props = defineProps<{ transactions: any[] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart<"pie", number[], string> | null = null

const renderChart = () => {
  if (!canvasRef.value) return
  if (chart) chart.destroy()

  // Aggregate category data
  const categoryTotals: Record<string, number> = {}
  props.transactions.forEach(t => {
    if (!categoryTotals[t.category]) categoryTotals[t.category] = 0
    categoryTotals[t.category] += t.amount
  })

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#38bdf8', '#4ade80'
      ],
    }]
  }

  chart = new Chart(canvasRef.value, {
    type: 'pie',
    data,
    options: {
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      }
    }
  })
}

onMounted(renderChart)
watch(() => props.transactions, renderChart, { deep: true })
</script>

<template>
  <div class="bg-white rounded-xl shadow p-4">
    <h3 class="text-lg font-semibold mb-2">Category Breakdown</h3>
    <canvas ref="canvasRef" width="300" height="300"></canvas>
  </div>
</template>
