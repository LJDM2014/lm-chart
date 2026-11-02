/**
 * 春运迁徙飞线图 option 构建：geo 底图 + lines 尾迹特效 + 枢纽涟漪散点。
 * 地图在挂载前由 ensureChinaMap 注册（public/geo/china.json 运行时加载）。
 */
import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import { CHINA_MAP_NAME } from '@/adapters/geoMap'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { cities, cityCoordMap, flowRoutes } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  { key: 'trailLength', label: '尾迹长度', type: 'slider', min: 0.1, max: 0.6, step: 0.05, default: 0.25 },
  { key: 'speed', label: '飞行速度', type: 'slider', min: 40, max: 240, step: 20, default: 120 },
  { key: 'curvature', label: '弧线弯曲', type: 'slider', min: 0, max: 0.5, step: 0.05, default: 0.25 },
  { key: 'showLabel', label: '城市名称', type: 'toggle', default: true },
  { key: 'showHub', label: '枢纽涟漪', type: 'toggle', default: true },
]

/** 航线颜色：出发枢纽色 */
const HUB_COLOR_INDEX: Record<string, number> = {
  广州: 0,
  上海: 2,
  北京: 4,
  深圳: 5,
  成都: 3,
}

/** 近距离城市的标签方位覆盖：配合 hideOverlap 防止名称被吞 */
type LabelPos = 'left' | 'right' | 'top' | 'bottom'
const LABEL_POS: Record<string, LabelPos> = {
  深圳: 'bottom',
  杭州: 'bottom',
  南京: 'top',
  合肥: 'left',
  重庆: 'bottom',
  南昌: 'bottom',
  长沙: 'left',
}

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const trailLength = typeof params?.trailLength === 'number' ? params.trailLength : 0.25
  const speed = typeof params?.speed === 'number' ? params.speed : 120
  const curvature = typeof params?.curvature === 'number' ? params.curvature : 0.25
  const showHub = params?.showHub !== false
  const showLabel = params?.showLabel !== false

  const maxValue = Math.max(...flowRoutes.map((r) => r.value))
  const linesData = flowRoutes.map((r) => {
    const from = cityCoordMap[r.from]
    const to = cityCoordMap[r.to]
    const colorIdx = HUB_COLOR_INDEX[r.from] ?? 1
    return {
      coords: [
        [from.lon, from.lat],
        [to.lon, to.lat],
      ],
      value: r.value,
      lineStyle: {
        color: palette[colorIdx % palette.length],
        width: 1 + (r.value / maxValue) * 3.5,
      },
    }
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      ...baseTooltip(theme),
      formatter: (raw: unknown) => {
        const p = raw as { data?: { coords?: [number, number][]; value?: number } }
        const coords = p.data?.coords
        if (!coords) return ''
        const nameOf = (c: [number, number]) =>
          cities.find((city) => city.lon === c[0] && city.lat === c[1])?.name ?? ''
        return `${nameOf(coords[0])} → ${nameOf(coords[1])}<br/>日均流动：<b>${p.data?.value}</b> 万人次`
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
      emphasis: { itemStyle: { areaColor: withAlpha(palette[0], 0.25) }, label: { show: false } },
      select: { itemStyle: { areaColor: withAlpha(palette[0], 0.25) }, label: { show: false } },
    },
    series: [
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        effect: {
          show: true,
          period: 5,
          trailLength,
          symbol: 'arrow',
          symbolSize: 5,
          constantSpeed: speed,
        },
        lineStyle: {
          opacity: 0.55,
          curveness: curvature,
        },
        data: linesData,
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        symbolSize: 8,
        rippleEffect: { brushType: 'stroke', scale: 3 },
        itemStyle: { color: palette[0], shadowBlur: 8, shadowColor: withAlpha(palette[0], 0.6) },
        labelLayout: { hideOverlap: true },
        label: {
          show: showLabel && showHub,
          formatter: '{b}',
          position: 'right',
          color: theme.text,
          fontSize: 11,
          fontWeight: 600,
        },
        data: Object.keys(HUB_COLOR_INDEX)
          .map((name) => {
            const c = cityCoordMap[name]
            return c ? { name: c.name, value: [c.lon, c.lat] } : null
          })
          .filter((d): d is { name: string; value: [number, number] } => d !== null)
          .map((d) => ({
            ...d,
            label: { position: LABEL_POS[d.name] ?? ('right' as const) },
          })),
      },
      {
        // 目的地城市：普通散点 + 名称标签，保证所有参与路线的城市名称可见
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        symbolSize: 4,
        itemStyle: { color: theme.isDark ? '#8b94a8' : '#5c6474' },
        labelLayout: { hideOverlap: true },
        label: {
          show: showLabel,
          formatter: '{b}',
          position: 'right',
          color: theme.textSecondary,
          fontSize: 10,
        },
        data: cities
          .filter((c) => !(c.name in HUB_COLOR_INDEX))
          .map((c) => ({
            name: c.name,
            value: [c.lon, c.lat],
            label: { position: LABEL_POS[c.name] ?? ('right' as const) },
          })),
      },
    ],
  }
}
