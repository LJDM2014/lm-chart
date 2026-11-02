import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'theme-river',
  title: '主题河流图',
  category: 'stats',
  lib: 'echarts',
  tags: ['河流', '时序', '主题热度', '堆叠'],
  description:
    '多条彩色“河流”随时间起伏流动，宽度表示主题热度。适合展示多年期话题、技术或品类的热度演变与相互消长。',
  difficulty: 'intermediate',
}

export default meta
