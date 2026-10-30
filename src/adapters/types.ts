/**
 * 图表库统一适配器接口。
 * 所有图表库（ECharts / G2 / Chart.js / ApexCharts / D3）的接入都实现该接口，
 * 图表组件只面向适配器编程，不直接触碰各库 API 的差异细节。
 */
import type { ParamValues } from '@/types/params'

export interface ChartAdapter {
  /** 挂载图表到目标容器（config 的具体形式由各库适配器自行约定） */
  mount(el: HTMLElement, config?: unknown): void
  /** 容器尺寸变化时重绘 */
  resize(): void
  /** 销毁实例，防止内存泄漏 */
  destroy(): void
  /**
   * 可选：增量应用参数面板的参数变化。
   * 实现必须复用已有实例（setOption / updateOptions 等），禁止销毁重建。
   */
  update?(params: ParamValues): void
}
