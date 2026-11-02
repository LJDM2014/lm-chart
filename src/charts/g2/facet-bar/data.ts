/** 连锁零售 2025 年月度销售额（万元）：品类 × 区域 × 月份 */
export interface RetailSale {
  month: string
  category: string
  region: string
  sales: number
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const CATEGORIES: Array<{ name: string; base: number; peak: number[] }> = [
  { name: '数码家电', base: 180, peak: [5, 10, 11] },
  { name: '服饰鞋包', base: 140, peak: [3, 4, 10] },
  { name: '食品生鲜', base: 110, peak: [0, 5, 8] },
]
const REGIONS: Array<{ name: string; factor: number }> = [
  { name: '华东', factor: 1.35 },
  { name: '华南', factor: 1.1 },
  { name: '华北', factor: 0.95 },
]

/** 确定性伪随机：同样输入永远得到同样数值 */
function jitter(i: number, j: number, k: number): number {
  return 0.86 + (((i * 31 + j * 17 + k * 7) % 23) / 23) * 0.28
}

export const retailSales: RetailSale[] = CATEGORIES.flatMap((category, i) =>
  REGIONS.flatMap((region, j) =>
    MONTHS.map((month, k) => {
      const seasonal = category.peak.includes(k) ? 1.45 : 1 + Math.sin(((k + 2) / 12) * Math.PI * 2) * 0.12
      return {
        month,
        category: category.name,
        region: region.name,
        sales: Math.round(category.base * region.factor * seasonal * jitter(i, j, k)),
      }
    }),
  ),
)
