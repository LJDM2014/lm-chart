/** 2025 全年每日编码提交量演示数据：[日期 'YYYY-MM-DD', 提交数] */
export type DayValue = [string, number]

export const YEAR_RANGE: [string, string] = ['2025-01-01', '2025-12-31']

/** 确定性伪随机数（保证每次渲染数据一致） */
function seeded(seed: number): number {
  const x = Math.sin(seed * 91.7 + 47.3) * 3758.5453
  return x - Math.floor(x)
}

function buildYearData(): DayValue[] {
  const data: DayValue[] = []
  const current = new Date(Date.UTC(2025, 0, 1))
  const end = new Date(Date.UTC(2025, 11, 31))
  let i = 0
  while (current <= end) {
    const dow = current.getUTCDay()
    const month = current.getUTCMonth()
    const s = i * 7.13
    let value = 0
    // 周末低活跃，工作日高活跃；春节/国庆两周为假期低谷
    const holiday =
      (month === 0 && current.getUTCDate() < 21) ||
      (month === 9 && current.getUTCDate() < 7)
    if (!holiday) {
      const weekdayFactor = dow === 0 || dow === 6 ? 0.35 : 1
      const seasonFactor = 0.75 + 0.25 * Math.sin((month / 12) * Math.PI * 2)
      value = Math.round((3 + seeded(s) * 14 + seeded(s + 0.5) * 6) * weekdayFactor * seasonFactor)
      // 少量爆发日
      if (seeded(s + 0.9) > 0.965) value += 18
    }
    data.push([current.toISOString().slice(0, 10), value])
    current.setUTCDate(current.getUTCDate() + 1)
    i++
  }
  return data
}

export const days: DayValue[] = buildYearData()

export const maxCommit = days.reduce((max, [, v]) => Math.max(max, v), 0)
