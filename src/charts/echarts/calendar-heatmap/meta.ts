import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'calendar-heatmap',
  title: '日历热力图',
  category: 'stats',
  lib: 'echarts',
  tags: ['日历', '热力图', '年度', '时间序列'],
  description:
    '以 GitHub 贡献图的形式展示一整年的每日活跃数据，通过 Calendar 坐标系 + 热力系列实现，适合呈现打卡、提交、销量等日粒度节律。',
  difficulty: 'intermediate',
}

export default meta
