/**
 * 图表通用主题色板：亮 / 暗双主题下统一的文字、轴线、网格、提示框与系列颜色。
 * 供所有图表库适配器与图表 config 使用，保证全站图表观感一致。
 */

export interface ChartTheme {
  isDark: boolean
  /** 主文字 */
  text: string
  /** 次要文字（坐标轴标签等） */
  textSecondary: string
  /** 更弱文字 */
  textTertiary: string
  /** 轴线颜色 */
  axisLine: string
  /** 网格分割线 */
  splitLine: string
  /** 面板背景 */
  surface: string
  /** 次级背景 */
  surfaceAlt: string
  tooltipBg: string
  tooltipBorder: string
  /** 系列分类色板 */
  palette: string[]
}

const LIGHT: ChartTheme = {
  isDark: false,
  text: '#1f2329',
  textSecondary: '#646a73',
  textTertiary: '#8f959e',
  axisLine: '#c9cdd4',
  splitLine: '#e5e6eb',
  surface: '#ffffff',
  surfaceAlt: '#f5f6fa',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e5e6eb',
  palette: ['#4a6cf7', '#22c1dc', '#f5a623', '#f25555', '#34c77b', '#a855f7', '#ec4899', '#14b8a6'],
}

const DARK: ChartTheme = {
  isDark: true,
  text: '#e8eaed',
  textSecondary: '#9aa0aa',
  textTertiary: '#6b7280',
  axisLine: '#414654',
  splitLine: '#2c313d',
  surface: '#1b1e27',
  surfaceAlt: '#12141a',
  tooltipBg: '#232735',
  tooltipBorder: '#3a3f4d',
  palette: ['#6d85ff', '#3ed3e8', '#fbbf24', '#f87171', '#4ade80', '#b678f9', '#f472b6', '#2dd4bf'],
}

export function getChartTheme(isDark: boolean): ChartTheme {
  return isDark ? DARK : LIGHT
}

/** 十六进制颜色转 rgba（用于面积填充、散点透明度等） */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** 可选配色方案（参数面板「配色方案」控件）：空数组表示使用主题默认色板 */
const PALETTES: Record<string, string[]> = {
  default: [],
  warm: ['#f97316', '#f43f5e', '#f59e0b', '#ef4444', '#fb7185', '#d97706', '#fbbf24', '#fda4af'],
  ocean: ['#0ea5e9', '#2563eb', '#06b6d4', '#3b82f6', '#6366f1', '#0d9488', '#38bdf8', '#1d4ed8'],
  mint: ['#10b981', '#14b8a6', '#22c55e', '#84cc16', '#2dd4bf', '#4ade80', '#a3e635', '#34d399'],
}

/** 根据参数面板取值解析最终色板：未选或选「默认」时回落到主题色板 */
export function resolvePalette(params: { palette?: unknown } | undefined, theme: ChartTheme): string[] {
  const key = typeof params?.palette === 'string' ? params.palette : 'default'
  const override = PALETTES[key]
  return override && override.length > 0 ? override : theme.palette
}

/** 通用 tooltip 样式（ECharts 用） */
export function tooltipStyle(theme: ChartTheme): Record<string, unknown> {
  return {
    backgroundColor: theme.tooltipBg,
    borderColor: theme.tooltipBorder,
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: theme.text, fontSize: 12 },
    extraCssText: 'border-radius: 8px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);',
  }
}
