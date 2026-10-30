<script setup lang="ts">
/**
 * ECharts 通用渲染容器：所有 ECharts 图表的 Chart.vue 都复用该组件。
 * - 挂载前可异步加载扩展插件（如 liquidfill / wordcloud）
 * - 挂载 / 自适应 resize / 主题重绘 / 参数调节 / 销毁 全部委托给适配器
 * - 参数经 CHART_PARAMS_KEY 注入（详情页参数面板提供），rAF 合帧后增量应用
 */
import { inject, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createEchartsAdapter } from '@/adapters/echarts'
import type { EChartsOption } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ChartAdapter } from '@/adapters/types'
import { CHART_PARAMS_KEY } from '@/types/params'

const props = defineProps<{
  /** 根据主题与参数构建完整 option（来自图表的 config.ts） */
  buildOption: (theme: ChartTheme, params?: import('@/types/params').ParamValues) => EChartsOption
  /** 需要在挂载前加载的扩展插件（副作用导入） */
  plugins?: Array<() => Promise<unknown>>
}>()

const hostRef = ref<HTMLElement>()
let adapter: ChartAdapter | null = null

/** 详情页参数面板注入（独立使用图表组件时为 null） */
const paramsRef = inject(CHART_PARAMS_KEY, null)

let updateRaf = 0
function scheduleUpdate() {
  if (updateRaf) return
  updateRaf = requestAnimationFrame(() => {
    updateRaf = 0
    adapter?.update?.(paramsRef?.value ?? {})
  })
}

watch(
  () => paramsRef?.value,
  (value) => {
    if (value) scheduleUpdate()
  },
)

onMounted(async () => {
  if (props.plugins && props.plugins.length > 0) {
    await Promise.all(props.plugins.map((load) => load()))
  }
  if (!hostRef.value) return
  adapter = createEchartsAdapter(props.buildOption)
  adapter.mount(hostRef.value)
  if (paramsRef?.value) adapter.update?.(paramsRef.value)
})

onBeforeUnmount(() => {
  if (updateRaf) {
    cancelAnimationFrame(updateRaf)
    updateRaf = 0
  }
  adapter?.destroy()
  adapter = null
})
</script>

<template>
  <div ref="hostRef" class="echarts-host"></div>
</template>

<style scoped>
.echarts-host {
  width: 100%;
  height: 100%;
}
</style>
