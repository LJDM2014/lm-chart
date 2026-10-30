import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'sankey-diagram',
  title: '桑基图',
  category: 'relation',
  lib: 'echarts',
  tags: ['桑基图', '流量', '能源'],
  description: '展示能量 / 资金 / 流量在不同节点间流转的桑基图，分支宽度与流量成正比。',
  difficulty: 'intermediate',
}

export default meta
