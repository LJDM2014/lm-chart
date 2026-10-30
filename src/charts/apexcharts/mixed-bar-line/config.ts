import type { ApexOptions } from 'apexcharts'
import type { ApexChartConfig } from '@/adapters/apexcharts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { monthLabels, revenue, growthRate } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'barOpacity', label: '柱透明度', type: 'slider', min: 0.2, max: 1, step: 0.05, default: 0.9 },
  { key: 'lineWidth', label: '折线宽度', type: 'slider', min: 1, max: 5, step: 0.5, default: 3, unit: 'px' },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ApexChartConfig {
  const palette = resolvePalette(params, theme)
  const barOpacity = typeof params?.barOpacity === 'number' ? params.barOpacity : 0.9
  const lineWidth = typeof params?.lineWidth === 'number' ? params.lineWidth : 3

  const options: ApexOptions = {
    series: [
      { name: '销售额（万元）', type: 'column', data: revenue },
      { name: '同比增长率（%）', type: 'line', data: growthRate },
    ],
    chart: {
      type: 'line',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: params?.animation !== false },
    },
    colors: [palette[0], palette[2]],
    stroke: { width: [0, lineWidth], curve: 'smooth' },
    // 柱透明度作用于柱系列，折线保持 ApexCharts 默认 0.9
    fill: { opacity: [barOpacity, 0.9] },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    legend: {
      position: 'bottom',
      labels: { colors: theme.textSecondary },
      markers: { size: 5 },
    },
    xaxis: {
      categories: monthLabels,
      labels: { style: { colors: theme.textSecondary } },
      axisBorder: { color: theme.axisLine },
      axisTicks: { color: theme.axisLine },
    },
    yaxis: [
      {
        title: { text: '销售额（万元）', style: { color: theme.textTertiary } },
        labels: { style: { colors: theme.textSecondary } },
      },
      {
        opposite: true,
        title: { text: '同比增长率（%）', style: { color: theme.textTertiary } },
        labels: { style: { colors: theme.textSecondary }, formatter: (v: number) => `${v}%` },
      },
    ],
    grid: { borderColor: theme.splitLine },
    tooltip: { theme: theme.isDark ? 'dark' : 'light' },
  }

  return { options }
}
