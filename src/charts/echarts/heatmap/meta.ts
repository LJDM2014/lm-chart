import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'heatmap',
  title: '热力图',
  category: 'stats',
  lib: 'echarts',
  tags: ['热力图', '二维分布', '活跃度'],
  description: '一周内各时段用户活跃度的二维热力分布，颜色深浅映射数值大小。',
  difficulty: 'intermediate',
}

export default meta
