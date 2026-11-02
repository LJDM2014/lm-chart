/** 新能源车企年度交付量（万辆，中国市场口径演示数据） */
export const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const

export interface BrandSales {
  brand: string
  /** 与 YEARS 对齐的逐年交付量（万辆） */
  sales: number[]
}

export const BRAND_SALES: BrandSales[] = [
  { brand: '比亚迪', sales: [24.8, 45.9, 62.2, 73.0, 186.3, 302.4, 427.2, 560.0] },
  { brand: '特斯拉', sales: [13.2, 36.1, 50.0, 32.1, 48.4, 60.4, 71.0, 86.2] },
  { brand: '问界', sales: [0, 0, 0, 0, 0.8, 9.4, 38.9, 55.1] },
  { brand: '五菱', sales: [9.4, 17.3, 33.2, 45.6, 60.2, 52.1, 48.3, 44.0] },
  { brand: '理想', sales: [0, 0, 3.3, 3.4, 9.0, 25.1, 50.0, 62.3] },
  { brand: '埃安', sales: [2.0, 4.2, 6.1, 12.4, 27.4, 48.0, 55.2, 62.5] },
  { brand: '零跑', sales: [0, 0.2, 1.1, 0.8, 6.2, 11.4, 29.4, 48.6] },
  { brand: '蔚来', sales: [1.1, 2.3, 5.7, 5.4, 12.2, 14.2, 22.3, 28.5] },
  { brand: '小鹏', sales: [0.4, 1.6, 3.8, 4.5, 12.1, 14.6, 19.0, 23.8] },
  { brand: '哪吒', sales: [0, 0.5, 1.8, 3.0, 15.2, 19.0, 12.8, 10.2] },
]

/** 某一年度帧的排序数据 */
export interface RaceFrame {
  year: number
  items: Array<{ name: string; value: number }>
}

/** 取第 frame 帧的年份与数据（frame 超出年份范围时循环） */
export function frameAt(frame: number): RaceFrame {
  const year = YEARS[frame % YEARS.length]
  return {
    year,
    items: BRAND_SALES.map((b) => ({ name: b.brand, value: b.sales[frame % YEARS.length] })),
  }
}

/** 总帧数（= 年份数） */
export const TOTAL_FRAMES = YEARS.length
