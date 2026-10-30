import type { EChartsOption } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { keywords } from './data'

// 词云系列类型来自 echarts-wordcloud 扩展，不在内置 EChartsOption 类型内
type WordCloudOption = Record<string, unknown>

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  {
    key: 'rotate',
    label: '旋转方式',
    type: 'select',
    default: 'random',
    options: [
      { label: '随机', value: 'random' },
      { label: '水平', value: 'horizontal' },
      { label: '45度', value: 'diagonal' },
      { label: '垂直', value: 'vertical' },
    ],
  },
  { key: 'minFontSize', label: '字号下限', type: 'slider', min: 10, max: 24, step: 1, default: 13, unit: 'px' },
]

/** 旋转方式 → 词云旋转区间与步长 */
const ROTATION_MAP: Record<string, { rotationRange: [number, number]; rotationStep: number }> = {
  random: { rotationRange: [-45, 45], rotationStep: 45 },
  horizontal: { rotationRange: [0, 0], rotationStep: 45 },
  diagonal: { rotationRange: [45, 45], rotationStep: 45 },
  vertical: { rotationRange: [90, 90], rotationStep: 90 },
}

export function buildOption(theme: ChartTheme, params?: ParamValues): WordCloudOption {
  const palette = resolvePalette(params, theme)
  const rotate = params?.rotate
  const rotation =
    typeof rotate === 'string' && rotate in ROTATION_MAP ? ROTATION_MAP[rotate] : ROTATION_MAP.random
  const minFontSize = typeof params?.minFontSize === 'number' ? params.minFontSize : 13

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: {
      show: true,
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: theme.text, fontSize: 12 },
      formatter: (params: { name: string; value: number }) => `${params.name}：${params.value}`,
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '92%',
        height: '92%',
        sizeRange: [minFontSize, 46],
        rotationRange: rotation.rotationRange,
        rotationStep: rotation.rotationStep,
        gridSize: 8,
        drawOutOfBound: false,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 600,
          color: () => palette[Math.floor(Math.random() * palette.length)],
        },
        emphasis: {
          textStyle: {
            shadowBlur: 10,
            shadowColor: withAlphaLocal(palette[0], 0.4),
          },
        },
        data: keywords,
      },
    ],
  } as unknown as EChartsOption
}

function withAlphaLocal(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
