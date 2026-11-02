import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'realtime-line',
  title: '实时滑动窗口折线图',
  category: 'interaction',
  lib: 'chartjs',
  tags: ['实时数据', '滑动窗口', '数据流', '折线图'],
  description:
    'Chart.js 实时滑动窗口折线图：模拟车联网平台三个区域集群的上行带宽速率流，数据窗口恒定 45 个采样点，新点推入旧点滑出。',
  difficulty: 'advanced',
}

export default meta
