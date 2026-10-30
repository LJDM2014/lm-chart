import type { EChartsOption } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { progress, progressLabel } from './data'

// 水球图系列类型来自 echarts-liquidfill 扩展，不在内置 EChartsOption 类型内
type LiquidFillOption = Record<string, unknown>

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'amplitude', label: '波幅', type: 'slider', min: 2, max: 20, step: 1, default: 8, unit: 'px' },
  { key: 'showOutline', label: '外框显示', type: 'toggle', default: true },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): LiquidFillOption {
  const palette = resolvePalette(params, theme)
  const amplitude = typeof params?.amplitude === 'number' ? params.amplitude : 8
  const showOutline = params?.showOutline !== false

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    series: [
      {
        type: 'liquidFill',
        data: [progress, progress * 0.92, progress * 0.85],
        radius: '72%',
        center: ['50%', '52%'],
        color: [
          withAlpha(palette[0], 0.85),
          withAlpha(palette[0], 0.55),
          withAlpha(palette[1], 0.4),
        ],
        backgroundStyle: { color: theme.surfaceAlt },
        outline: {
          show: showOutline,
          borderDistance: 6,
          itemStyle: {
            borderWidth: 3,
            borderColor: withAlpha(palette[0], 0.7),
            shadowBlur: 12,
            shadowColor: withAlpha(palette[0], 0.35),
          },
        },
        label: {
          formatter: progressLabel,
          fontSize: 32,
          fontWeight: 600,
          color: theme.text,
        },
        amplitude,
        waveLength: '80%',
        waveAnimation: true,
        animationDuration: 1500,
      },
    ],
  } as unknown as EChartsOption
}
