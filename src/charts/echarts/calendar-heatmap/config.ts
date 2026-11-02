import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { days, maxCommit, YEAR_RANGE } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'cellSize', label: '格子尺寸', type: 'slider', min: 12, max: 22, step: 1, unit: 'px', default: 16 },
  { key: 'cellRadius', label: '格子圆角', type: 'slider', min: 0, max: 8, step: 1, unit: 'px', default: 3 },
  { key: 'showVisualMap', label: '色阶图例', type: 'toggle', default: true },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const cellSize = typeof params?.cellSize === 'number' ? params.cellSize : 16
  const cellRadius = typeof params?.cellRadius === 'number' ? params.cellRadius : 3
  const showVisualMap = params?.showVisualMap !== false

  const hotColor = palette[0]
  const midColor = palette[5] ?? palette[0]

  return {
    backgroundColor: 'transparent',
    animation: true,
    tooltip: {
      ...baseTooltip(theme),
      formatter: (raw: unknown) => {
        const p = raw as { value?: [string, number] }
        const v = p.value ?? ['', 0]
        return `${v[0]}<br/>提交：<b>${v[1]}</b> 次`
      },
    },
    visualMap: {
      show: showVisualMap,
      min: 0,
      max: maxCommit,
      calculable: false,
      orient: 'horizontal',
      right: 24,
      top: 0,
      itemWidth: 12,
      itemHeight: 90,
      textStyle: { color: theme.textSecondary, fontSize: 11 },
      inRange: {
        color: [theme.surfaceAlt, withAlpha(midColor, 0.45), hotColor],
      },
    },
    calendar: {
      top: 48,
      left: 48,
      right: 24,
      cellSize: ['auto', cellSize],
      range: YEAR_RANGE,
      itemStyle: { color: theme.surfaceAlt, borderWidth: 3, borderColor: theme.surface },
      splitLine: { show: false },
      yearLabel: { show: false },
      monthLabel: {
        color: theme.textSecondary,
        fontSize: 12,
        nameMap: 'cn',
      },
      dayLabel: {
        color: theme.textTertiary,
        fontSize: 11,
        margin: 8,
        nameMap: ['日', '一', '二', '三', '四', '五', '六'],
        firstDay: 1,
      },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: days,
        itemStyle: { borderRadius: cellRadius },
      },
    ],
  }
}
