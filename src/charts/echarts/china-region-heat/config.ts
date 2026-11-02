/**
 * 省份填色热力地图 option 构建：map series + visualMap 连续色阶。
 * 地图在挂载前由 ensureChinaMap 注册（public/geo/china.json 运行时加载）。
 */
import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import { CHINA_MAP_NAME } from '@/adapters/geoMap'
import type { ChartTheme } from '@/adapters/chartTheme'
import { withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { INDEX_MAX, provinceIndex } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  {
    key: 'colorScheme',
    label: '色阶方案',
    type: 'select',
    default: 'ocean',
    options: [
      { label: '海洋蓝绿', value: 'ocean' },
      { label: '暖阳橙红', value: 'sunset' },
      { label: '极光紫青', value: 'aurora' },
    ],
  },
  { key: 'borderWidth', label: '边界线宽', type: 'slider', min: 0.5, max: 3, step: 0.5, default: 1 },
  { key: 'showLabel', label: '显示省名', type: 'toggle', default: false },
  {
    key: 'legendPos',
    label: '图例位置',
    type: 'select',
    default: 'bottom',
    options: [
      { label: '底部', value: 'bottom' },
      { label: '左下竖排', value: 'left' },
    ],
  },
]

/** 色阶方案：低 → 高 */
const SCHEMES: Record<string, string[]> = {
  ocean: ['#e8f4f8', '#7fc8d8', '#3a9bbf', '#2272a8', '#144d7a'],
  sunset: ['#fdf3e0', '#f8c471', '#ef8b45', '#d95f2b', '#a83a1e'],
  aurora: ['#eef2ff', '#9fb8f0', '#6a7fdb', '#4d55b8', '#2f318a'],
}

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const schemeKey = params?.colorScheme
  const colors = SCHEMES[typeof schemeKey === 'string' ? schemeKey : 'ocean'] ?? SCHEMES['ocean']
  const borderWidth = typeof params?.borderWidth === 'number' ? params.borderWidth : 1
  const showLabel = params?.showLabel === true
  const legendPos = params?.legendPos === 'left' ? 'left' : 'bottom'

  return {
    backgroundColor: 'transparent',
    tooltip: {
      ...baseTooltip(theme),
      formatter: (raw: unknown) => {
        const p = raw as { name?: string; value?: number }
        const v = p.value ?? 0
        return `${p.name}<br/>数字经济指数：<b>${v ? v : '—'}</b>`
      },
    },
    visualMap: {
      min: 0,
      max: INDEX_MAX,
      calculable: true,
      orient: legendPos === 'left' ? 'vertical' : 'horizontal',
      ...(legendPos === 'left' ? { left: 16, bottom: 24 } : { left: 'center', bottom: 12 }),
      itemWidth: 12,
      itemHeight: legendPos === 'left' ? 110 : 90,
      text: ['高', '低'],
      textStyle: { color: theme.textSecondary, fontSize: 11 },
      inRange: { color: colors },
    },
    series: [
      {
        type: 'map',
        map: CHINA_MAP_NAME,
        roam: true,
        zoom: 1.12,
        top: 18,
        bottom: 60,
        data: provinceIndex,
        itemStyle: {
          borderColor: theme.isDark ? '#0f131c' : theme.surface,
          borderWidth,
        },
        label: {
          show: showLabel,
          color: theme.isDark ? '#c8ceda' : '#3a4358',
          fontSize: 9,
        },
        emphasis: {
          itemStyle: {
            areaColor: withAlpha(colors[colors.length - 1], 0.85),
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,0.35)',
          },
          label: { show: true, color: '#ffffff', fontSize: 10 },
        },
        select: { itemStyle: { areaColor: withAlpha(colors[colors.length - 1], 0.85) }, label: { show: true } },
      },
    ],
  }
}
