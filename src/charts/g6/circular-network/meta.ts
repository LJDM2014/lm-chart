import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'circular-network',
  title: '环形关系图',
  category: 'relation',
  lib: 'g6',
  tags: ['环形布局', '微服务', '调用拓扑', 'quadratic'],
  description:
    'AntV G6 环形布局关系图：电商微服务间调用拓扑，节点沿圆环按连接度排列，quadratic 边可调弧度形成束状流向。',
  difficulty: 'intermediate',
}

export default meta
