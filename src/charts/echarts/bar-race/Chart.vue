<script setup lang="ts">
/**
 * 动态排序条形图：定时推进年份帧 + 增量 setOption（merge 模式保留动画换位）。
 * 不走 EchartsChart 通用容器（其 update 为 notMerge 全量替换会打断动画），
 * 直接使用适配器并传入 setup 钩子管理定时器；销毁时清理。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createEchartsAdapter } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ChartAdapter } from '@/adapters/types'
import type { ParamValues } from '@/types/params'
import { CHART_PARAMS_KEY } from '@/types/params'
import { buildOption } from './config'
import { TOTAL_FRAMES } from './data'

/** 基础时钟步长：播放间隔参数以该步长累加计量 */
const TICK_MS = 100

const hostRef = ref<HTMLElement>()
/** 当前播放帧（年份序号，循环推进） */
const frame = ref(0)
const paramsRef = inject(CHART_PARAMS_KEY, null)

let adapter: ChartAdapter | null = null

/** 帧感知的 option 工厂：主题/参数重绘时保持当前帧 */
const buildFrameOption = (theme: ChartTheme, params?: ParamValues) =>
  buildOption(theme, params, frame.value)

onMounted(() => {
  if (!hostRef.value) return
  adapter = createEchartsAdapter(buildFrameOption, ({ chart, getTheme, getParams }) => {
    let elapsed = 0
    const timer = window.setInterval(() => {
      const p = getParams()
      const interval = typeof p.frameMs === 'number' ? p.frameMs : 900
      elapsed += TICK_MS
      if (elapsed < interval) return
      elapsed = 0
      frame.value = (frame.value + 1) % TOTAL_FRAMES
      // merge 模式：realtimeSort 换位 + valueAnimation 数值滚动动画得以保留
      chart.setOption(buildFrameOption(getTheme(), p))
    }, TICK_MS)
    return () => window.clearInterval(timer)
  })
  adapter.mount(hostRef.value)
  if (paramsRef?.value) adapter.update?.(paramsRef.value)
})

// 参数面板变化：增量应用（适配器内部 setOption，不销毁）
watch(
  () => paramsRef?.value,
  (value) => {
    if (value) adapter?.update?.(value)
  },
)

onBeforeUnmount(() => {
  adapter?.destroy()
  adapter = null
})
</script>

<template>
  <div ref="hostRef" class="bar-race-host"></div>
</template>

<style scoped>
.bar-race-host {
  width: 100%;
  height: 100%;
}
</style>
