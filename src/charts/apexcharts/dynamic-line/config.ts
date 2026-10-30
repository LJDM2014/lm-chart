import type { ApexOptions } from 'apexcharts'
import type { ApexChartConfig } from '@/adapters/apexcharts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { makeInitialData, nextValue, REFRESH_INTERVAL, WINDOW_SIZE } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'strokeWidth', label: '线条宽度', type: 'slider', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'px' },
  { key: 'markers', label: '显示数据点', type: 'toggle', default: false },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ApexChartConfig {
  const palette = resolvePalette(params, theme)
  const strokeWidth = typeof params?.strokeWidth === 'number' ? params.strokeWidth : 2.5
  const showMarkers = params?.markers === true

  const data = makeInitialData()
  let lastValue = data[data.length - 1]?.y ?? 50

  const options: ApexOptions = {
    series: [{ name: 'QPS', data }],
    chart: {
      type: 'line',
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: params?.animation !== false, easing: 'linear', dynamicAnimation: { speed: 500 } },
    },
    colors: [palette[1]],
    stroke: { width: strokeWidth, curve: 'smooth' },
    dataLabels: { enabled: false },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: theme.textSecondary }, datetimeUTC: false },
      axisBorder: { color: theme.axisLine },
      axisTicks: { color: theme.axisLine },
      range: WINDOW_SIZE * REFRESH_INTERVAL,
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { style: { colors: theme.textSecondary } },
    },
    grid: { borderColor: theme.splitLine },
    markers: { size: showMarkers ? 4 : 0, hover: { size: 5 } },
    tooltip: { theme: theme.isDark ? 'dark' : 'light' },
  }

  return {
    options,
    // 动态刷新：定时推送新数据点，销毁时清理定时器
    setup: (chart) => {
      const timer = window.setInterval(() => {
        lastValue = nextValue(lastValue)
        data.push({ x: Date.now(), y: Math.round(lastValue) })
        if (data.length > WINDOW_SIZE) data.shift()
        void chart.updateSeries([{ name: 'QPS', data: [...data] }], false)
      }, REFRESH_INTERVAL)
      return () => window.clearInterval(timer)
    },
  }
}
