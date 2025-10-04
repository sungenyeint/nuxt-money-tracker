<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  transactions: any[]
}>()

const monthlyExpenses = computed(() => {
  const result: Record<string, number> = {}
  props.transactions.forEach(t => {
    if (t.type === 'expense') {
      const date = new Date(t.date)
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      result[month] = (result[month] || 0) + t.amount
    }
  })
  return result
})

const weeklyExpenses = computed(() => {
  const result: Record<string, number> = {}
  props.transactions.forEach(t => {
    if (t.type === 'expense') {
      const date = new Date(t.date)
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      console.log('Transaction Date:', date, 'Week:', week) // Debugging line
      result[week] = (result[week] || 0) + t.amount
    }
  })
  return result
})

const exportCSV = () => {
  let csv = 'Month,Expense\n'
  Object.entries(monthlyExpenses.value).forEach(([month, amount]) => {
    csv += `${month},${amount}\n`
  })
  csv += '\nWeek,Expense\n'
  Object.entries(weeklyExpenses.value).forEach(([week, amount]) => {
    csv += `${week},${amount}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'expense-report.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportPDF = async () => {
  try {
    const [{ default: jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])

    const doc = new jsPDF()
    doc.text('Monthly Expense Report', 14, 16)
    autoTable.default(doc, {
      startY: 22,
      head: [['Month', 'Expense']],
      body: Object.entries(monthlyExpenses.value).map(([month, amount]) => [month, amount]),
    })
    doc.text('Weekly Expense Report', 14, (doc as any).lastAutoTable.finalY + 10)
    autoTable.default(doc, {
      startY: (doc as any).lastAutoTable.finalY + 16,
      head: [['Week', 'Expense']],
      body: Object.entries(weeklyExpenses.value).map(([week, amount]) => [week, amount]),
    })
    doc.save('expense-report.pdf')
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF. Please try again.')
  }
}
</script>

<template>
  <div>
    <div class="bg-white rounded-xl shadow p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Monthly Expense Report</h3>
      <table class="w-full text-left border">
        <thead>
          <tr class="bg-gray-50">
            <th class="py-2 px-3">Month</th>
            <th class="py-2 px-3">Expense</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(amount, month) in monthlyExpenses" :key="month">
            <td class="py-2 px-3">{{ month }}</td>
            <td class="py-2 px-3 text-red-600 font-semibold">{{ amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="bg-white rounded-xl shadow p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Weekly Expense Report</h3>
      <table class="w-full text-left border">
        <thead>
          <tr class="bg-gray-50">
            <th class="py-2 px-3">Week</th>
            <th class="py-2 px-3">Expense</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(amount, week) in weeklyExpenses" :key="week">
            <td class="py-2 px-3">{{ week }}</td>
            <td class="py-2 px-3 text-red-600 font-semibold">{{ amount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex gap-4">
      <button @click="exportCSV"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Export CSV</button>
      <button @click="exportPDF"
        class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Export PDF</button>
    </div>
  </div>
</template>
