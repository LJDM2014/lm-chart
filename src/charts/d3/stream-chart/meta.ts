import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'stream-chart',
  title: '河流图',
  category: 'stats',
  lib: 'd3',
  tags: ['河流图', 'streamgraph', '堆叠面积', '趋势'],
  description:
    'D3 手写河流图（d3-shape stack + area）：1965-2020 年全球主要发电方式的发电量构成，曲线流式围绕中轴展开，可切换平滑曲线与层叠布局。',
  difficulty: 'intermediate',
}

export default meta
