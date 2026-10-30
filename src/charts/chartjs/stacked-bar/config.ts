import type { ChartConfiguration } from 'chart.js'
import { resolvePalette, withAlpha, type ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { quarterLabels, deptFrontend, deptBackend, deptDesign, deptQa } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'barWidth', label: '柱宽百分比', type: 'slider', min: 0.3, max: 1, step: 0.05, default: 0.9 },
  { key: 'legend', label: '显示图例', type: 'toggle', default: true },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ChartConfiguration {
  const palette = resolvePalette(params, theme)
  const barWidth = typeof params?.barWidth === 'number' ? params.barWidth : 0.9
  const showLegend = params?.legend !== false

  const makeDataset = (label: string, color: string, data: number[]) => ({
    label,
    data,
    backgroundColor: withAlpha(color, 0.75),
    borderColor: color,
    borderWidth: 1,
    borderRadius: 3,
    barPercentage: barWidth,
  })

  return {
    type: 'bar',
    data: {
      labels: quarterLabels,
      datasets: [
        makeDataset('前端', palette[0], deptFrontend),
        makeDataset('后端', palette[1], deptBackend),
        makeDataset('设计', palette[2], deptDesign),
        makeDataset('测试', palette[4], deptQa),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: params?.animation === false ? false : { duration: 700 },
      plugins: {
        legend: { display: showLegend, position: 'bottom', labels: { color: theme.textSecondary, boxWidth: 12 } },
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
          stacked: true,
          ticks: { color: theme.textSecondary },
          grid: { display: false },
          border: { color: theme.axisLine },
        },
        y: {
          stacked: true,
          ticks: { color: theme.textSecondary },
          grid: { color: theme.splitLine },
          border: { display: false },
        },
      },
    },
  }
}
