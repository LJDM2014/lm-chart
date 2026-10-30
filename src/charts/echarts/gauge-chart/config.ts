import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { defaultScore, scoreSections } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'score', label: '健康评分', type: 'slider', min: 0, max: 100, step: 1, default: defaultScore },
  { key: 'showPointer', label: '显示指针', type: 'toggle', default: true },
  { key: 'ringWidth', label: '圆环宽度', type: 'slider', min: 8, max: 36, step: 1, default: 20, unit: 'px' },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const score = typeof params?.score === 'number' ? params.score : defaultScore
  const showPointer = params?.showPointer !== false
  const ringWidth = typeof params?.ringWidth === 'number' ? params.ringWidth : 20

  /** 用参数分值动态生成分档着色：未达标区段灰显，达标段用主题色板 */
  const sections = scoreSections.map((section, index) => {
    const reached = score >= (scoreSections[index - 1]?.value ?? 0)
    return [section.value, reached ? palette[index % palette.length] : theme.splitLine] as [number, string]
  })

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: { ...baseTooltip(theme), formatter: '健康评分：{c}' },
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '92%',
        center: ['50%', '58%'],
        progress: { show: true, width: ringWidth, roundCap: true },
        axisLine: { roundCap: true, lineStyle: { width: ringWidth, color: sections } },
        pointer: {
          show: showPointer,
          length: '58%',
          width: 5,
          itemStyle: { color: theme.isDark ? '#e8eaed' : '#1f2329' },
        },
        axisTick: { show: false },
        splitLine: { length: 10, distance: ringWidth + 6, lineStyle: { color: theme.splitLine, width: 2 } },
        axisLabel: { distance: ringWidth + 22, color: theme.textSecondary, fontSize: 11 },
        anchor: { show: showPointer, size: 12, itemStyle: { color: palette[0] } },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '42%'],
          fontSize: 30,
          fontWeight: 700,
          color: theme.text,
          formatter: '{value}',
        },
        data: [{ value: score, name: 'score' }],
      },
    ],
  }
}
