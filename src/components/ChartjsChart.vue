<script setup lang="ts">
/**
 * Chart.js 通用渲染容器：所有 Chart.js 图表的 Chart.vue 都复用该组件。
 * 参数经 CHART_PARAMS_KEY 注入，rAF 合帧后增量应用。
 */
import { inject, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createChartJsAdapter } from '@/adapters/chartjs'
import type { ChartConfiguration } from '@/adapters/chartjs'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ChartAdapter } from '@/adapters/types'
import { CHART_PARAMS_KEY } from '@/types/params'

const props = defineProps<{
  buildConfig: (
    theme: ChartTheme,
    params?: import('@/types/params').ParamValues,
  ) => ChartConfiguration
}>()

const hostRef = ref<HTMLElement>()
let adapter: ChartAdapter | null = null

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

onMounted(() => {
  if (!hostRef.value) return
  adapter = createChartJsAdapter(props.buildConfig)
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
  <div ref="hostRef" class="chartjs-host"></div>
</template>

<style scoped>
/* Chart.js 响应式要求父容器定位可靠且尺寸确定 */
.chartjs-host {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
