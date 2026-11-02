import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: '3d-scatter',
  title: '3D 散点图',
  category: 'stats',
  lib: 'echarts',
  tags: ['3D', '散点', 'echarts-gl', '多维'],
  description:
    '基于 echarts-gl 的三维散点图，将三个维度同时映射到空间坐标，支持视角旋转与自动巡航，适合探索三变量间的聚类关系。',
  difficulty: 'advanced',
  featured: true,
}

export default meta
