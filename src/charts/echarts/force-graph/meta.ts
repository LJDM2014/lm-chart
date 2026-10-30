import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'force-graph',
  title: '力导向关系图',
  category: 'relation',
  lib: 'echarts',
  tags: ['关系图', '力导向', '网络'],
  description: '力导向布局的关系网络图，支持拖拽与缩放，适合展示人物关系、知识图谱等网络结构。',
  difficulty: 'advanced',
  featured: true,
}

export default meta
