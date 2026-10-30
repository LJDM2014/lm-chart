import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { deviceShare } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'innerRadius', label: '内半径', type: 'slider', min: 20, max: 70, step: 1, default: 48, unit: '%' },
  {
    key: 'roseType',
    label: '南丁格尔模式',
    type: 'select',
    default: 'none',
    options: [
      { label: '关闭', value: 'none' },
      { label: '半径模式', value: 'radius' },
    ],
  },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const innerRadius = typeof params?.innerRadius === 'number' ? params.innerRadius : 48
  const roseType: 'radius' | undefined = params?.roseType === 'radius' ? 'radius' : undefined
  const total = deviceShare.reduce((sum, item) => sum + item.value, 0)

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: { ...baseTooltip(theme), formatter: '{b}<br/>{c} 次（{d}%）' },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: theme.textSecondary },
    },
    title: {
      text: '总访问量',
      subtext: total.toLocaleString(),
      left: 'center',
      top: '38%',
      itemGap: 4,
      textStyle: { color: theme.textTertiary, fontSize: 13, fontWeight: 400 },
      subtextStyle: { color: theme.text, fontSize: 24, fontWeight: 600 },
    },
    series: [
      {
        name: '设备来源',
        type: 'pie',
        radius: [`${innerRadius}%`, '72%'],
        roseType,
        center: ['50%', '48%'],
        data: deviceShare,
        itemStyle: {
          borderRadius: 6,
          borderColor: theme.surface,
          borderWidth: 2,
        },
        label: { color: theme.textSecondary, formatter: '{b} {d}%' },
        emphasis: {
          scaleSize: 6,
          label: { show: false },
        },
      },
    ],
  }
}
