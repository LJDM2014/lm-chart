/**
 * 中国城市涟漪地图 option 构建：geo 底图 + effectScatter 涟漪散点。
 * 地图在挂载前由 ensureChinaMap 注册（public/geo/china.json 运行时加载）。
 */
import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import { CHINA_MAP_NAME } from '@/adapters/geoMap'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { cityMetrics, METRIC_NAME } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'symbolSize', label: '散点大小', type: 'slider', min: 6, max: 20, step: 1, unit: 'px', default: 10 },
  { key: 'rippleScale', label: '涟漪范围', type: 'slider', min: 1.5, max: 6, step: 0.5, default: 3 },
  {
    key: 'topN',
    label: '展示城市',
    type: 'select',
    default: 'all',
    options: [
      { label: 'Top 8', value: '8' },
      { label: 'Top 12', value: '12' },
      { label: '全部', value: 'all' },
    ],
  },
  { key: 'showLabel', label: '城市名', type: 'toggle', default: true },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const symbolSize = typeof params?.symbolSize === 'number' ? params.symbolSize : 10
  const rippleScale = typeof params?.rippleScale === 'number' ? params.rippleScale : 3
  const showLabel = params?.showLabel !== false
  const topRaw = params?.topN
  const topN = topRaw === '8' ? 8 : topRaw === '12' ? 12 : cityMetrics.length

  /** 按指数降序取前 N 城市 */
  const sorted = [...cityMetrics].sort((a, b) => b.value - a.value).slice(0, topN)
  const scatterData = sorted.map((c) => ({ name: c.name, value: [c.lon, c.lat, c.value] }))

  return {
    backgroundColor: 'transparent',
    tooltip: {
      ...baseTooltip(theme),
      formatter: (raw: unknown) => {
        const p = raw as { name?: string; value?: [number, number, number] }
        const v = p.value ?? [0, 0, 0]
        return `${p.name}<br/>${METRIC_NAME}：<b>${v[2]}</b>`
      },
    },
    geo: {
      map: CHINA_MAP_NAME,
      roam: true,
      zoom: 1.12,
      top: 18,
      bottom: 12,
      itemStyle: {
        areaColor: theme.isDark ? '#1d2230' : '#eef2f8',
        borderColor: theme.isDark ? '#3a4358' : theme.axisLine,
        borderWidth: 1,
      },
      emphasis: {
        itemStyle: { areaColor: withAlpha(palette[0], 0.35) },
        label: { show: false },
      },
      select: { itemStyle: { areaColor: withAlpha(palette[0], 0.35) }, label: { show: false } },
    },
    series: [
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: (raw: unknown) => {
          const v = (raw as [number, number, number])[2] ?? 0
          return symbolSize * (0.55 + v / 140)
        },
        rippleEffect: { brushType: 'stroke', scale: rippleScale },
        itemStyle: { color: palette[0], shadowBlur: 8, shadowColor: withAlpha(palette[0], 0.6) },
        label: {
          show: showLabel,
          formatter: '{b}',
          position: 'right',
          color: theme.text,
          fontSize: 11,
        },
        zlevel: 2,
      },
    ],
  }
}
