/**
 * 实时滑动窗口折线 config：窗口数据由 Chart.vue 持有并滚动，
 * buildConfig 仅按主题/参数渲染当前窗口快照（参数与主题变化不重置数据流）。
 */
import type { ChartConfiguration } from 'chart.js'
import { resolvePalette, withAlpha, type ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { CLUSTERS, makeInitialData, type WindowData } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  { key: 'refreshMs', label: '刷新间隔', type: 'slider', min: 500, max: 3000, step: 250, default: 1000, unit: 'ms' },
  { key: 'smooth', label: '曲线平滑', type: 'toggle', default: true },
  { key: 'showPoints', label: '显示数据点', type: 'toggle', default: false },
  { key: 'showGrid', label: '显示网格线', type: 'toggle', default: true },
]

export function buildConfig(
  theme: ChartTheme,
  params?: ParamValues,
  /** 当前窗口快照；缺省时生成初始窗口（通用容器场景） */
  data: WindowData = makeInitialData(),
): ChartConfiguration {
  const palette = resolvePalette(params, theme)
  const smooth = params?.smooth !== false
  const showPoints = params?.showPoints === true
  const showGrid = params?.showGrid !== false

  return {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: CLUSTERS.map((c, i) => ({
        label: c.name,
        data: data.series[i],
        borderColor: palette[i % palette.length],
        backgroundColor: withAlpha(palette[i % palette.length], 0.1),
        borderWidth: 2,
        fill: i === 0,
        tension: smooth ? 0.35 : 0,
        pointRadius: showPoints ? 2.5 : 0,
        pointHoverRadius: 4,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
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
          ticks: { color: theme.textTertiary, maxTicksLimit: 8, maxRotation: 0 },
          border: { color: theme.axisLine },
        },
        y: {
          min: 0,
          title: { display: true, text: '上行带宽 (Gbps)', color: theme.textSecondary },
          grid: { color: theme.splitLine, display: showGrid },
          ticks: { color: theme.textSecondary },
          border: { display: false },
        },
      },
    },
  }
}
