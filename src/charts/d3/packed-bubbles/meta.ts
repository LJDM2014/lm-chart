import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'packed-bubbles',
  title: '打包气泡图',
  category: 'creative',
  lib: 'd3',
  tags: ['packed circles', 'd3-hierarchy', '气泡图', '规模对比'],
  description:
    'D3 手写打包气泡图（d3-hierarchy pack）：主流 App 月活规模打包排布，气泡面积映射月活，按品类着色，悬停查看详情。',
  difficulty: 'advanced',
}

export default meta
