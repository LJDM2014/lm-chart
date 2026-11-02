import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'chord-diagram',
  title: '弦图',
  category: 'relation',
  lib: 'd3',
  tags: ['弦图', 'chord', '流量关系', '矩阵'],
  description: 'D3 手写弦图（d3-chord + d3-shape）：六大城市群间年度人口迁徙流量，弧段表示迁入迁出总量、弦的粗细表示两地间的双向流量。',
  difficulty: 'advanced',
}

export default meta
