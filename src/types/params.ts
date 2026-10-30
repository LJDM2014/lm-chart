/**
 * 参数调节面板的类型与通用控件。
 * 每个图表在 config.ts 中导出 controls（控件声明），
 * build 函数消费 params 生成应用了参数的配置；适配器通过 update(params) 增量应用。
 */
import type { InjectionKey, Ref } from 'vue'

export type ParamValue = boolean | number | string

/** 一次参数调节的全部取值（扁平键值对） */
export type ParamValues = Record<string, ParamValue>

export interface ControlOption {
  label: string
  value: string
}

/** 参数面板控件声明 */
export interface ControlDef {
  key: string
  label: string
  type: 'toggle' | 'slider' | 'select'
  default: ParamValue
  /** slider 专用 */
  min?: number
  max?: number
  step?: number
  /** 数值显示单位 */
  unit?: string
  /** select 专用 */
  options?: ControlOption[]
}

/** 通用控件：配色方案（所有图表库均支持，经 resolvePalette 应用） */
export const PALETTE_CONTROL: ControlDef = {
  key: 'palette',
  label: '配色方案',
  type: 'select',
  default: 'default',
  options: [
    { label: '默认', value: 'default' },
    { label: '暖阳', value: 'warm' },
    { label: '海洋', value: 'ocean' },
    { label: '薄荷', value: 'mint' },
  ],
}

/**
 * 详情页向图表容器组件注入当前参数的 key。
 * 值为每次参数变化都生成新对象的 computed Ref，容器 shallow watch 即可感知。
 */
export const CHART_PARAMS_KEY: InjectionKey<Ref<ParamValues>> = Symbol('chart-params')
