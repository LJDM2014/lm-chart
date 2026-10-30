/** 实时监控曲线初始数据：最近 20 个采样点 */
export interface SamplePoint {
  x: number
  y: number
}

export const WINDOW_SIZE = 20
export const REFRESH_INTERVAL = 1600
export const BASE_VALUE = 55

export function nextValue(prev: number): number {
  return Math.min(95, Math.max(15, prev + (Math.random() - 0.5) * 14))
}

export function makeInitialData(): SamplePoint[] {
  const now = Date.now()
  const data: SamplePoint[] = []
  let v = BASE_VALUE
  for (let i = WINDOW_SIZE; i > 0; i--) {
    v = nextValue(v)
    data.push({ x: now - i * REFRESH_INTERVAL, y: Math.round(v) })
  }
  return data
}
