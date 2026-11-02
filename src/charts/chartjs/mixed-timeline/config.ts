import type { ChartConfiguration } from 'chart.js'
import { resolvePalette, withAlpha, type ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { conversionRate, months, visitors } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'smooth', label: '折线平滑', type: 'toggle', default: true },
  { key: 'barRadius', label: '柱圆角', type: 'slider', min: 0, max: 14, step: 1, default: 6, unit: 'px' },
  { key: 'showGrid', label: '显示网格线', type: 'toggle', default: true },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ChartConfiguration {
  const palette = resolvePalette(params, theme)
  const smooth = params?.smooth !== false
  const barRadius = typeof params?.barRadius === 'number' ? params.barRadius : 6
  const showGrid = params?.showGrid !== false

  return {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          type: 'bar' as const,
          label: '月访问量 (万人次)',
          data: visitors,
          backgroundColor: withAlpha(palette[0], 0.75),
          borderRadius: barRadius,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line' as const,
          label: '付费转化率 (%)',
          data: conversionRate,
          borderColor: palette[3],
          backgroundColor: palette[3],
          borderWidth: 2.5,
          pointRadius: 3.5,
          tension: smooth ? 0.4 : 0,
          yAxisID: 'y1',
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: params?.animation === false ? false : { duration: 700 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: theme.textSecondary, boxWidth: 12, usePointStyle: true } },
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
          grid: { display: false },
          ticks: { color: theme.textSecondary },
          border: { color: theme.axisLine },
        },
        y: {
          position: 'left',
          title: { display: true, text: '访问量 (万人次)', color: theme.textSecondary },
          grid: { color: theme.splitLine, display: showGrid },
          ticks: { color: theme.textSecondary },
          border: { display: false },
        },
        y1: {
          position: 'right',
          min: 0,
          max: 8,
          title: { display: true, text: '转化率 (%)', color: theme.textSecondary },
          grid: { drawOnChartArea: false },
          ticks: { color: theme.textSecondary },
          border: { display: false },
        },
      },
    },
  }
}
