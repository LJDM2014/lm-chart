import type { ChartConfiguration } from 'chart.js'
import { resolvePalette, withAlpha, type ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { monthLabels, dau } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'tension', label: '曲线张力', type: 'slider', min: 0, max: 0.5, step: 0.05, default: 0.4 },
  { key: 'fill', label: '面积填充', type: 'toggle', default: true },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ChartConfiguration {
  const palette = resolvePalette(params, theme)
  const tension = typeof params?.tension === 'number' ? params.tension : 0.4
  const fillArea = params?.fill !== false

  return {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'DAU',
          data: dau,
          borderColor: palette[0],
          backgroundColor: withAlpha(palette[0], fillArea ? 0.18 : 0),
          fill: fillArea,
          tension,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: palette[0],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: params?.animation === false ? false : { duration: 700 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.text,
          bodyColor: theme.textSecondary,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        x: {
          ticks: { color: theme.textSecondary },
          grid: { display: false },
          border: { color: theme.axisLine },
        },
        y: {
          ticks: { color: theme.textSecondary },
          grid: { color: theme.splitLine },
          border: { display: false },
        },
      },
    },
  }
}
