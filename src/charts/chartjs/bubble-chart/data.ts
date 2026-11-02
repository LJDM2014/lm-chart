/** 智能硬件产品线竞争格局：x 市场份额(%)、y 用户满意度(分)、r 年营收(亿元) */
export interface ProductBubble {
  x: number
  y: number
  r: number
  model: string
}

export interface ProductLine {
  line: string
  products: ProductBubble[]
}

export const productLines: ProductLine[] = [
  {
    line: '智能手机',
    products: [
      { model: '旗舰 Pro', x: 18.5, y: 91, r: 8.6 },
      { model: '标准版', x: 12.2, y: 85, r: 5.4 },
      { model: '青春版', x: 7.8, y: 78, r: 3.1 },
    ],
  },
  {
    line: '平板电脑',
    products: [
      { model: 'Pad Air', x: 9.6, y: 88, r: 4.2 },
      { model: 'Pad Mini', x: 5.4, y: 82, r: 2.0 },
      { model: '学习平板', x: 3.1, y: 74, r: 1.2 },
    ],
  },
  {
    line: '智能穿戴',
    products: [
      { model: 'Watch Ultra', x: 11.3, y: 89, r: 3.8 },
      { model: 'Watch SE', x: 8.2, y: 84, r: 2.4 },
      { model: '手环', x: 14.7, y: 76, r: 1.8 },
    ],
  },
]
