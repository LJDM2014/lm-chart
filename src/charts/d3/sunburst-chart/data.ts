/** 集团年度预算树：三层构成（集团 → 事业群 → 产品/职能线），叶节点带预算值（亿元） */
export interface BudgetNode {
  name: string
  /** 叶节点预算（亿元），非叶节点由子级汇总 */
  value?: number
  children?: BudgetNode[]
}

export const budgetTree: BudgetNode = {
  name: '集团预算',
  children: [
    {
      name: '智能制造',
      children: [
        { name: '整机制造', value: 32 },
        { name: '供应链', value: 21 },
        { name: '质量工程', value: 9 },
      ],
    },
    {
      name: '数字化',
      children: [
        { name: '云服务', value: 26 },
        { name: '数据智能', value: 14 },
        { name: '安全合规', value: 7 },
      ],
    },
    {
      name: '消费电子',
      children: [
        { name: '手机产品线', value: 38 },
        { name: '智能穿戴', value: 15 },
        { name: '生态服务', value: 8 },
      ],
    },
    {
      name: '创新投资',
      children: [
        { name: '前沿研究', value: 11 },
        { name: '孵化器', value: 6 },
      ],
    },
  ],
}
