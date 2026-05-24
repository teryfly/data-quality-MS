import { mockDatasets } from './datasets.js'

export function generateUploadMonitor(yearMonth = '2026-05') {
  const daysInMonth = new Date(yearMonth.slice(0,4), yearMonth.slice(5,7), 0).getDate()
  return mockDatasets.map(ds => {
    const dailyCounts = {}
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${yearMonth}-${String(d).padStart(2,'0')}`
      const dateObj = new Date(date)
      const isWeekend = dateObj.getDay() % 6 === 0
      const baseCount = ds.isRequired ? (isWeekend ? 200 : 800) : (isWeekend ? 50 : 200)
      // 10%概率漏报（演示数据质量问题）
      dailyCounts[date] = Math.random() < 0.1 ? 0 : Math.floor(baseCount * (0.7 + Math.random() * 0.6))
    }
    return {
      ...ds,
      dailyCounts,
      monthTotal: Object.values(dailyCounts).reduce((a,b) => a+b, 0)
    }
  })
}
