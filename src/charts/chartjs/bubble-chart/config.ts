import type { ChartConfiguration } from 'chart.js'
import { resolvePalette, withAlpha, type ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { productLines } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'bubbleScale', label: '气泡缩放', type: 'slider', min: 0.5, max: 2, step: 0.1, default: 1, unit: 'x' },
  { key: 'fillOpacity', label: '气泡透明度', type: 'slider', min: 0.15, max: 0.9, step: 0.05, default: 0.45 },
  { key: 'showGrid', label: '显示网格线', type: 'toggle', default: true },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ChartConfiguration {
  const palette = resolvePalette(params, theme)
  const bubbleScale = typeof params?.bubbleScale === 'number' ? params.bubbleScale : 1
  const fillOpacity = typeof params?.fillOpacity === 'number' ? params.fillOpacity : 0.45
  const showGrid = params?.showGrid !== false

  return {
    type: 'bubble',
    data: {
      datasets: productLines.map((line, i) => ({
        label: line.line,
        data: line.products.map((p) => ({ x: p.x, y: p.y, r: Math.max(3, p.r * bubbleScale * 4) })),
        backgroundColor: withAlpha(palette[i * 3], fillOpacity),
        borderColor: palette[i * 3],
        borderWidth: 1.5,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: params?.animation === false ? false : { duration: 600 },
      plugins: {
        legend: { position: 'bottom', labels: { color: theme.textSecondary, boxWidth: 12, usePointStyle: true } },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.text,
          bodyColor: theme.textSecondary,
          borderColor: theme.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (raw) => {
              const item = raw as unknown as { datasetIndex: number; dataIndex: number; parsed: { x: number; y: number } }
              const product = productLines[item.datasetIndex]?.products[item.dataIndex]
              const name = product ? product.model : `产品 ${item.dataIndex + 1}`
              return [
                `${name}：份额 ${item.parsed.x}% / 满意度 ${item.parsed.y}`,
                `年营收约 ${(product ? product.r : 0).toFixed(1)} 亿元`,
              ]
            },
          },
        },
      },
      scales: {
        x: {
          min: 0,
          max: 25,
          title: { display: true, text: '市场份额 (%)', color: theme.textSecondary },
          grid: { color: theme.splitLine, display: showGrid },
          ticks: { color: theme.textSecondary },
          border: { color: theme.axisLine },
        },
        y: {
          min: 60,
          max: 100,
          title: { display: true, text: '用户满意度 (分)', color: theme.textSecondary },
          grid: { color: theme.splitLine, display: showGrid },
          ticks: { color: theme.textSecondary },
          border: { color: theme.axisLine },
        },
      },
    },
  }
}
