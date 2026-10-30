/** 个股 30 日行情演示数据：[时间戳, 开盘, 最高, 最低, 收盘] */
export type OhlcRow = [number, number, number, number, number]

function genOhlc(): OhlcRow[] {
  const rows: OhlcRow[] = []
  let price = 82
  const start = new Date('2026-09-01').getTime()
  for (let i = 0; i < 30; i++) {
    const open = price
    const drift = (Math.random() - 0.48) * 4
    const close = Math.max(60, open + drift)
    const high = Math.max(open, close) + Math.random() * 2
    const low = Math.min(open, close) - Math.random() * 2
    rows.push([start + i * 86400000, +open.toFixed(2), +high.toFixed(2), +low.toFixed(2), +close.toFixed(2)])
    price = close
  }
  return rows
}

export const ohlc: OhlcRow[] = genOhlc()

export const candleData = ohlc.map(([date, o, h, l, c]) => ({ x: date, y: [o, h, l, c] }))
