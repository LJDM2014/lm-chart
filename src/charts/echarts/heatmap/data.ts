/** 一周 × 时段活跃度演示数据 */
export const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const hours = ['0时', '2时', '4时', '6时', '8时', '10时', '12时', '14时', '16时', '18时', '20时', '22时']

/** [hourIndex, dayIndex, value] */
export type HeatPoint = [number, number, number]

function genData(): HeatPoint[] {
  const data: HeatPoint[] = []
  for (let d = 0; d < days.length; d++) {
    for (let h = 0; h < hours.length; h++) {
      // 模拟活跃度：工作日早晚高峰、周末全天较高
      const isWeekend = d >= 5
      const peak = isWeekend ? 6 : [4, 5, 6, 9, 10].includes(h) ? 9 : 3
      const base = isWeekend ? 5 : 3
      const value = Math.max(0, Math.round(peak * Math.random() * 0.6 + base * Math.random()))
      data.push([h, d, value])
    }
  }
  return data
}

export const heatData: HeatPoint[] = genData()
