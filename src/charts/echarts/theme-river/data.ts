/** 2020-2025 各技术主题月度热度演示数据：[月份 'YYYY-MM', 热度, 主题] */
export type ThemePoint = [string, number, string]

export const TOPICS = ['人工智能', '大前端', '云原生', '大数据'] as const

export const MONTHS: string[] = (() => {
  const list: string[] = []
  for (let year = 2020; year <= 2025; year++) {
    for (let month = 1; month <= 12; month++) {
      list.push(`${year}-${String(month).padStart(2, '0')}`)
    }
  }
  return list
})()

/** 确定性伪随机数（保证每次渲染数据一致） */
function seeded(seed: number): number {
  const x = Math.sin(seed * 53.7 + 17.9) * 24758.5453
  return x - Math.floor(x)
}

function topicHeat(topicIndex: number, monthIndex: number): number {
  const totalMonths = MONTHS.length
  const t = monthIndex / totalMonths
  // 各主题不同趋势：AI 上升、前端平稳、云原生中段崛起、大数据先高后缓
  const trend = [
    12 + t * 52,
    40 + Math.sin(t * Math.PI) * 14,
    8 + Math.min(1, t * 2.2) * 46,
    46 - t * 20,
  ][topicIndex]
  const season = Math.sin((monthIndex / 12) * Math.PI * 2 + topicIndex) * 5
  const noise = (seeded(topicIndex * 1000 + monthIndex) - 0.5) * 8
  return Math.max(2, Math.round(trend + season + noise))
}

export const riverData: ThemePoint[] = MONTHS.flatMap((month, monthIndex) =>
  TOPICS.map((topic, topicIndex) => [month, topicHeat(topicIndex, monthIndex), topic] as ThemePoint),
)
