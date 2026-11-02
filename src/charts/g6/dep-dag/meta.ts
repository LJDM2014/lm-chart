import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'dep-dag',
  title: '依赖关系图',
  category: 'relation',
  lib: 'g6',
  tags: ['DAG', '依赖', '层次布局', 'monorepo'],
  description:
    'AntV G6 层次 DAG：某 monorepo 内部包的依赖关系，圆形节点按层级（核心 / 服务 / 界面 / 应用）着色，节点大小可按被依赖数（扇入）缩放。',
  difficulty: 'advanced',
}

export default meta
