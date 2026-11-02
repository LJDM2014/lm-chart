import type { ApexOptions } from 'apexcharts'
import type { ApexChartConfig } from '@/adapters/apexcharts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { commitCalendar } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'showValues', label: '显示数值', type: 'toggle', default: false },
  { key: 'highlightThreshold', label: '高亮阈值', type: 'slider', min: 5, max: 30, step: 1, default: 20, unit: '次' },
  { key: 'showGrid', label: '显示星期分隔', type: 'toggle', default: true },
]

/** 色阶分档：0~max 分为 5 档，颜色由弱到强 */
function buildColorRanges(baseColor: string, theme: ChartTheme, threshold: number) {
  const steps = [
    withAlpha(baseColor, 0.12),
    withAlpha(baseColor, 0.32),
    withAlpha(baseColor, 0.55),
    withAlpha(baseColor, 0.78),
    baseColor,
  ]
  const bucket = Math.ceil(32 / steps.length)
  const ranges = steps.map((color, i) => ({
    from: i * bucket,
    to: (i + 1) * bucket - 1,
    color,
    name: `${i * bucket}-${(i + 1) * bucket - 1} 次`,
  }))
  // 超过阈值的单元格用强调色（第三色板）单独标出
  if (threshold > 0 && threshold < 32) {
    ranges.push({
      from: threshold,
      to: 40,
      color: theme.palette[3],
      name: `≥ ${threshold} 次（高活跃）`,
    })
  }
  return ranges
}

export function buildConfig(theme: ChartTheme, params?: ParamValues): ApexChartConfig {
  const palette = resolvePalette(params, theme)
  const showValues = params?.showValues === true
  const threshold = typeof params?.highlightThreshold === 'number' ? params.highlightThreshold : 20
  const showGrid = params?.showGrid !== false

  const options: ApexOptions = {
    series: Object.entries(commitCalendar).map(([weekday, cells]) => ({
      name: weekday,
      data: cells,
    })),
    chart: {
      type: 'heatmap',
      background: 'transparent',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: params?.animation !== false },
    },
    theme: { mode: theme.isDark ? 'dark' : 'light' },
    dataLabels: {
      enabled: showValues,
      style: { colors: [theme.text] },
    },
    xaxis: {
      type: 'category',
      labels: { style: { colors: theme.textSecondary } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { style: { colors: theme.textSecondary } },
    },
    plotOptions: {
      heatmap: {
        radius: 3,
        enableShades: false,
        colorScale: {
          ranges: buildColorRanges(palette[0], theme, threshold),
        },
      },
    },
    grid: {
      show: showGrid,
      borderColor: theme.splitLine,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { theme: theme.isDark ? 'dark' : 'light' },
  }

  return { options }
}
