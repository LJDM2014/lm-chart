import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'china-map-scatter',
  title: '城市涟漪地图',
  category: 'geo',
  lib: 'echarts',
  tags: ['地图', '涟漪散点', 'geo', '城市分布'],
  description:
    'ECharts geo 涟漪散点地图：全国主要城市「科创指数」分布，涟漪大小映射指数高低，可拖拽缩放地图，支持筛选展示 Top N 城市。',
  difficulty: 'advanced',
}

export default meta
