/** 设备来源分布演示数据（访问量） */
export interface DeviceItem {
  name: string
  value: number
}

export const deviceShare: DeviceItem[] = [
  { name: '移动端', value: 5680 },
  { name: '桌面端', value: 4260 },
  { name: '平板', value: 1840 },
  { name: '小程序', value: 1084 },
]
