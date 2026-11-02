/**
 * 车联网平台区域集群上行带宽演示数据流。
 * 滑动窗口：labels + 各系列数值队列恒定 WINDOW_SIZE 个采样点。
 */

export const WINDOW_SIZE = 45

/** 定时器基础步长（Chart.vue 以该频率滚动窗口） */
export const TICK_MS = 1000

export interface ClusterSeries {
  name: string
  /** 基线带宽（Gbps），随机游走围绕基线波动 */
  base: number
}

export const CLUSTERS: ClusterSeries[] = [
  { name: '华东集群', base: 42 },
  { name: '华南集群', base: 31 },
  { name: '华北集群', base: 24 },
]

export interface WindowData {
  labels: string[]
  series: number[][]
}

function timeLabel(offsetMs = 0): string {
  const d = new Date(Date.now() - offsetMs)
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${mm}:${ss}`
}

/** 生成初始窗口数据（含历史采样点） */
export function makeInitialData(): WindowData {
  const labels: string[] = []
  const series = CLUSTERS.map(() => [] as number[])
  const currents = CLUSTERS.map((c) => c.base)

  for (let i = WINDOW_SIZE - 1; i >= 0; i--) {
    labels.push(timeLabel(i * TICK_MS))
    CLUSTERS.forEach((c, idx) => {
      currents[idx] = nextValue(currents[idx], c.base)
      series[idx].push(Math.round(currents[idx] * 10) / 10)
    })
  }
  return { labels, series }
}

/** 随机游走一步：围绕基线波动，限制在 [base*0.55, base*1.35] 区间 */
export function nextValue(current: number, base: number): number {
  const drift = (Math.random() - 0.5) * base * 0.08
  const pull = (base - current) * 0.06
  const next = current + drift + pull
  return Math.min(base * 1.35, Math.max(base * 0.55, next))
}

/** 滚动一步：推入新采样点，滑出最旧点 */
export function rollWindow(data: WindowData): void {
  data.labels.push(timeLabel())
  data.labels.shift()
  CLUSTERS.forEach((c, idx) => {
    const arr = data.series[idx]
    const last = arr[arr.length - 1] ?? c.base
    arr.push(Math.round(nextValue(last, c.base) * 10) / 10)
    arr.shift()
  })
}
