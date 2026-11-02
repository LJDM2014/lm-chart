/** 2025 年各大区新能源汽车销量（万辆，演示数据） */
export interface RegionSales {
  region: string
  value: number
}

export const REGION_SALES: RegionSales[] = [
  { region: '华东大区', value: 386 },
  { region: '华南大区', value: 274 },
  { region: '华北大区', value: 232 },
  { region: '华中大区', value: 168 },
  { region: '西南大区', value: 121 },
  { region: '东北大区', value: 64 },
  { region: '西北大区', value: 47 },
]
