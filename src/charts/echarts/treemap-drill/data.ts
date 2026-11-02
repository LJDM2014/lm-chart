/** 集团年度预算三维层级演示数据（单位：亿元） */
export interface BudgetNode {
  name: string
  value?: number
  children?: BudgetNode[]
}

export const budgetTree: BudgetNode = {
  name: '集团预算',
  children: [
    {
      name: '智能硬件',
      children: [
        {
          name: '消费电子',
          children: [
            { name: '智能手机', value: 62 },
            { name: '平板电脑', value: 28 },
            { name: '可穿戴', value: 19 },
          ],
        },
        {
          name: 'IoT 生态',
          children: [
            { name: '智能家居', value: 17 },
            { name: '车机互联', value: 24 },
          ],
        },
      ],
    },
    {
      name: '云与计算',
      children: [
        {
          name: '公有云',
          children: [
            { name: '弹性计算', value: 33 },
            { name: '对象存储', value: 15 },
            { name: '云安全', value: 11 },
          ],
        },
        {
          name: 'AI 平台',
          children: [
            { name: '大模型训练', value: 41 },
            { name: '推理服务', value: 16 },
          ],
        },
      ],
    },
    {
      name: '数字服务',
      children: [
        {
          name: '电商零售',
          children: [
            { name: '自营商城', value: 22 },
            { name: '开放平台', value: 14 },
          ],
        },
        {
          name: '内容与广告',
          children: [
            { name: '流媒体', value: 18 },
            { name: '精准广告', value: 21 },
          ],
        },
      ],
    },
    {
      name: '基础研究',
      children: [
        { name: '前沿实验室', value: 12 },
        { name: '专利运营', value: 5 },
        { name: '开源生态', value: 4 },
      ],
    },
  ],
}
