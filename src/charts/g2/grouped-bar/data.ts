/** 各产品季度销量演示数据 */
export interface ProductSale {
  quarter: string
  product: string
  value: number
}

export const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
export const products = ['产品 A', '产品 B', '产品 C']

export const sales: ProductSale[] = [
  { quarter: 'Q1', product: '产品 A', value: 820 },
  { quarter: 'Q1', product: '产品 B', value: 640 },
  { quarter: 'Q1', product: '产品 C', value: 520 },
  { quarter: 'Q2', product: '产品 A', value: 960 },
  { quarter: 'Q2', product: '产品 B', value: 780 },
  { quarter: 'Q2', product: '产品 C', value: 610 },
  { quarter: 'Q3', product: '产品 A', value: 1100 },
  { quarter: 'Q3', product: '产品 B', value: 920 },
  { quarter: 'Q3', product: '产品 C', value: 750 },
  { quarter: 'Q4', product: '产品 A', value: 1240 },
  { quarter: 'Q4', product: '产品 B', value: 1050 },
  { quarter: 'Q4', product: '产品 C', value: 880 },
]
