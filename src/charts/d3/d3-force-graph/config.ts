/**
 * 力导向关系图渲染配置：从主题推导颜色，其余为可调的物理参数。
 * Chart.vue 读取该配置完成手写 D3 渲染；参数面板变化时仅更新力模型并增量重启模拟。
 */
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'

/** 参数面板控件（斥力以正值「强度」暴露，内部转负值） */
export const controls: ControlDef[] = [
  { key: 'linkDistance', label: '连线距离', type: 'slider', min: 40, max: 200, step: 5, default: 90, unit: 'px' },
  { key: 'chargeStrength', label: '斥力强度', type: 'slider', min: 100, max: 600, step: 20, default: 320 },
  { key: 'showLabel', label: '节点标签', type: 'toggle', default: true },
]

export interface D3ForceRenderConfig {
  /** 连线颜色 */
  linkStroke: string
  linkWidth: number
  linkOpacity: number
  /** 节点标签 */
  labelFill: string
  labelFontSize: number
  showLabel: boolean
  /** 电荷斥力强度（负值越大连线越伸展） */
  chargeStrength: number
  /** 连线理想距离 */
  linkDistance: number
  /** 滚轮缩放倍率范围 */
  scaleExtent: [number, number]
}

export function buildRenderConfig(theme: ChartTheme, params?: ParamValues): D3ForceRenderConfig {
  return {
    linkStroke: theme.isDark ? '#3a3f4d' : theme.axisLine,
    linkWidth: 1.2,
    linkOpacity: 0.6,
    labelFill: theme.textSecondary,
    labelFontSize: 11,
    showLabel: params?.showLabel !== false,
    chargeStrength: -(typeof params?.chargeStrength === 'number' ? params.chargeStrength : 320),
    linkDistance: typeof params?.linkDistance === 'number' ? params.linkDistance : 90,
    scaleExtent: [0.5, 3],
  }
}
