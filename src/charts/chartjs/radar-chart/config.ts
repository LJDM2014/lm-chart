import type { ChartConfiguration } from 'chart.js'
import { resolvePalette, withAlpha, type ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { dimensions, phoneA, phoneB } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'fillOpacity', label: '填充透明度', type: 'slider', min: 0.05, max: 0.6, step: 0.05, default: 0.22 },
  { key: 'showGrid', label: '显示网格线', type: 'toggle', default: true },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ChartConfiguration {
  const palette = resolvePalette(params, theme)
  const fillOpacity = typeof params?.fillOpacity === 'number' ? params.fillOpacity : 0.22
  const showGrid = params?.showGrid !== false

  const makeDataset = (label: string, color: string, data: number[]) => ({
    label,
    data,
    backgroundColor: withAlpha(color, fillOpacity),
    borderColor: color,
    borderWidth: 2,
    pointBackgroundColor: color,
    pointRadius: 3,
  })

  return {
    type: 'radar',
    data: {
      labels: dimensions,
      datasets: [makeDataset('机型 A', palette[0], phoneA), makeDataset('机型 B', palette[6], phoneB)],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: params?.animation === false ? false : { duration: 700 },
      plugins: {
        legend: { position: 'bottom', labels: { color: theme.textSecondary, boxWidth: 12 } },
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
        r: {
          min: 0,
          max: 100,
          angleLines: { color: theme.splitLine, display: showGrid },
          grid: { color: theme.splitLine, display: showGrid },
          pointLabels: { color: theme.textSecondary, font: { size: 12 } },
          ticks: { display: false, stepSize: 25 },
        },
      },
    },
  }
}
