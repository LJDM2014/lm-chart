import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { withAlpha } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { clusters } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'pointSize', label: '散点大小', type: 'slider', min: 4, max: 16, step: 1, unit: 'px', default: 9 },
  { key: 'autoRotate', label: '自动旋转', type: 'toggle', default: true },
  { key: 'opacity', label: '散点透明度', type: 'slider', min: 0.4, max: 1, step: 0.05, default: 0.9 },
]

/**
 * scatter3D / grid3D 的配置项来自 echarts-gl 扩展，
 * 不在 echarts 核心 EChartsOption 类型内，这里以结构化对象构建后断言。
 */
export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const pointSize = typeof params?.pointSize === 'number' ? params.pointSize : 9
  const autoRotate = params?.autoRotate !== false
  const opacity = typeof params?.opacity === 'number' ? params.opacity : 0.9

  const axisCommon = {
    axisLine: { lineStyle: { color: theme.axisLine } },
    axisLabel: { color: theme.textSecondary, fontSize: 11 },
    splitLine: { lineStyle: { color: theme.splitLine } },
  }

  const option = {
    backgroundColor: 'transparent',
    animation: true,
    animationDurationUpdate: 600,
    tooltip: {
      ...baseTooltip(theme),
      formatter: (p: { seriesName?: string; value?: [number, number, number] }) => {
        const v = p.value ?? [0, 0, 0]
        return `<b>${p.seriesName ?? ''}</b><br/>面积：${v[0]} ㎡<br/>总价：${v[1]} 万<br/>楼龄：${v[2]} 年`
      },
    },
    legend: {
      top: 8,
      textStyle: { color: theme.textSecondary },
      data: clusters.map((c) => c.name),
    },
    xAxis3D: { type: 'value', name: '面积 (㎡)', nameTextStyle: { color: theme.textSecondary }, min: 30, ...axisCommon },
    yAxis3D: { type: 'value', name: '总价 (万)', nameTextStyle: { color: theme.textSecondary }, ...axisCommon },
    zAxis3D: { type: 'value', name: '楼龄 (年)', nameTextStyle: { color: theme.textSecondary }, max: 30, ...axisCommon },
    grid3D: {
      bottom: 28,
      boxWidth: 120,
      boxDepth: 90,
      viewControl: {
        autoRotate,
        autoRotateSpeed: 8,
        distance: 220,
        alpha: 22,
        beta: 35,
      },
      light: {
        main: { intensity: 1.2, shadow: false },
        ambient: { intensity: 0.4 },
      },
    },
    series: clusters.map((cluster, index) => ({
      type: 'scatter3D',
      name: cluster.name,
      symbolSize: pointSize,
      data: cluster.points,
      itemStyle: {
        color: withAlpha(palette[index % palette.length], opacity),
        borderWidth: 1,
        borderColor: withAlpha(palette[index % palette.length], 1),
      },
      emphasis: {
        itemStyle: { color: palette[index % palette.length] },
        label: { show: false },
      },
    })),
  }

  return option as unknown as EChartsOption
}
