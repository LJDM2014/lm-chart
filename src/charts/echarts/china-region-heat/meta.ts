import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'china-region-heat',
  title: '省份热力地图',
  category: 'geo',
  lib: 'echarts',
  tags: ['地图', '热力填色', 'visualMap', '省份'],
  description:
    'ECharts map 省份填色地图：各省份数字经济发展指数，visualMap 连续色阶渲染，支持三套配色方案切换与省名显示调节。',
  difficulty: 'advanced',
}

export default meta
