/** 三城市月均气温演示数据（℃） */
export interface CityTemp {
  month: string
  city: string
  value: number
}

export const temps: CityTemp[] = [
  { month: '1月', city: '北京', value: -3 }, { month: '1月', city: '上海', value: 5 }, { month: '1月', city: '广州', value: 15 },
  { month: '2月', city: '北京', value: 0 }, { month: '2月', city: '上海', value: 7 }, { month: '2月', city: '广州', value: 16 },
  { month: '3月', city: '北京', value: 7 }, { month: '3月', city: '上海', value: 11 }, { month: '3月', city: '广州', value: 20 },
  { month: '4月', city: '北京', value: 14 }, { month: '4月', city: '上海', value: 16 }, { month: '4月', city: '广州', value: 24 },
  { month: '5月', city: '北京', value: 20 }, { month: '5月', city: '上海', value: 22 }, { month: '5月', city: '广州', value: 27 },
  { month: '6月', city: '北京', value: 25 }, { month: '6月', city: '上海', value: 26 }, { month: '6月', city: '广州', value: 29 },
  { month: '7月', city: '北京', value: 27 }, { month: '7月', city: '上海', value: 30 }, { month: '7月', city: '广州', value: 30 },
  { month: '8月', city: '北京', value: 26 }, { month: '8月', city: '上海', value: 29 }, { month: '8月', city: '广州', value: 30 },
  { month: '9月', city: '北京', value: 21 }, { month: '9月', city: '上海', value: 25 }, { month: '9月', city: '广州', value: 28 },
  { month: '10月', city: '北京', value: 13 }, { month: '10月', city: '上海', value: 19 }, { month: '10月', city: '广州', value: 25 },
  { month: '11月', city: '北京', value: 5 }, { month: '11月', city: '上海', value: 13 }, { month: '11月', city: '广州', value: 21 },
  { month: '12月', city: '北京', value: -1 }, { month: '12月', city: '上海', value: 7 }, { month: '12月', city: '广州', value: 16 },
]
