import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'sunburst-chart',
  title: '旭日图',
  category: 'relation',
  lib: 'd3',
  tags: ['旭日图', 'sunburst', '层级', '占比'],
  description:
    'D3 手写旭日图（d3-hierarchy partition + d3-shape arc）：某科技集团年度预算的三层构成，环上每段表示一层级的预算占比，点击弧段可高亮其祖先与后代链路。',
  difficulty: 'advanced',
}

export default meta
