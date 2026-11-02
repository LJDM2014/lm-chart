/** 三个城市板块的房源三维分布演示数据：[面积(㎡), 总价(万), 楼龄(年)] */
export interface HouseCluster {
  name: string
  points: [number, number, number][]
}

/** 确定性伪随机数（保证每次渲染数据一致） */
function seeded(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function makeCluster(seed: number, count: number, center: [number, number, number], spread: [number, number, number]): [number, number, number][] {
  const points: [number, number, number][] = []
  for (let i = 0; i < count; i++) {
    const s = seed * 1000 + i
    const x = center[0] + (seeded(s) - 0.5) * 2 * spread[0]
    const y = center[1] + (seeded(s + 0.3) - 0.5) * 2 * spread[1] + (x - center[0]) * 0.8
    const z = Math.max(0.5, center[2] + (seeded(s + 0.7) - 0.5) * 2 * spread[2])
    points.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(z * 10) / 10])
  }
  return points
}

export const clusters: HouseCluster[] = [
  {
    name: '滨江新区',
    points: makeCluster(1, 42, [88, 320, 4], [18, 80, 3]),
  },
  {
    name: '老城核心区',
    points: makeCluster(2, 36, [62, 240, 18], [14, 60, 6]),
  },
  {
    name: '科技城远郊',
    points: makeCluster(3, 30, [110, 180, 2], [22, 55, 2]),
  },
]
