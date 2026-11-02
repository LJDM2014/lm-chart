import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'treemap-drill',
  title: '矩形树图（下钻）',
  category: 'relation',
  lib: 'echarts',
  tags: ['树图', '层级', '下钻', '占比'],
  description:
    '矩形树图以面积编码数值、嵌套编码层级，点击区块可逐层下钻（面包屑返回）。适合展示集团预算、目录结构等多级占比关系。',
  difficulty: 'advanced',
  featured: true,
}

export default meta
