/** 电商平台 2025 年月度经营数据 */
export interface MonthlySales {
  month: string
  gmv: number
}

export interface MonthlyGrowth {
  month: string
  growth: number
}

export const monthlySales: MonthlySales[] = [
  { month: '1月', gmv: 3200 }, { month: '2月', gmv: 2860 },
  { month: '3月', gmv: 4100 }, { month: '4月', gmv: 4350 },
  { month: '5月', gmv: 4800 }, { month: '6月', gmv: 6200 },
  { month: '7月', gmv: 5400 }, { month: '8月', gmv: 5750 },
  { month: '9月', gmv: 5900 }, { month: '10月', gmv: 6400 },
  { month: '11月', gmv: 8900 }, { month: '12月', gmv: 7600 },
]

export const monthlyGrowth: MonthlyGrowth[] = [
  { month: '1月', growth: 8.2 }, { month: '2月', growth: 5.1 },
  { month: '3月', growth: 12.6 }, { month: '4月', growth: 9.8 },
  { month: '5月', growth: 14.3 }, { month: '6月', growth: 22.5 },
  { month: '7月', growth: 11.4 }, { month: '8月', growth: 13.2 },
  { month: '9月', growth: 10.7 }, { month: '10月', growth: 15.9 },
  { month: '11月', growth: 28.4 }, { month: '12月', growth: 18.6 },
]
