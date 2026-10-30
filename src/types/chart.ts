/** 图表分类（6 类） */
export const CHART_CATEGORIES = [
  'basic',
  'stats',
  'relation',
  'geo',
  'creative',
  'interaction',
] as const

export type ChartCategory = (typeof CHART_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<ChartCategory, string> = {
  basic: '基础图表',
  stats: '统计分析',
  relation: '关系网络',
  geo: '地理空间',
  creative: '特色创意',
  interaction: '动态交互',
}

/** 支持的图表库 */
export const CHART_LIBS = ['echarts', 'g2', 'chartjs', 'apexcharts', 'd3'] as const

export type ChartLib = (typeof CHART_LIBS)[number]

export const LIB_LABELS: Record<ChartLib, string> = {
  echarts: 'ECharts',
  g2: 'AntV G2',
  chartjs: 'Chart.js',
  apexcharts: 'ApexCharts',
  d3: 'D3',
}

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

/** 图表元信息：每个图表目录下 meta.ts 的默认导出 */
export interface ChartMeta {
  /** 图表唯一 id，与目录名一致（如 'gradient-bar'） */
  id: string
  /** 展示标题 */
  title: string
  category: ChartCategory
  /** 所属图表库，与上级目录名一致 */
  lib: ChartLib
  tags: string[]
  description: string
  difficulty: Difficulty
  /** 是否精选（首页展示） */
  featured?: boolean
}
