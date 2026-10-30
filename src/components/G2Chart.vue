<script setup lang="ts">
/**
 * G2 通用渲染容器：所有 AntV G2 图表的 Chart.vue 都复用该组件。
 * 参数经 CHART_PARAMS_KEY 注入，rAF 合帧后增量应用。
 */
import { inject, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createG2Adapter } from '@/adapters/g2'
import type { G2Spec } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ChartAdapter } from '@/adapters/types'
import { CHART_PARAMS_KEY } from '@/types/params'

const props = defineProps<{
  buildSpec: (theme: ChartTheme, params?: import('@/types/params').ParamValues) => G2Spec
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
  adapter = createG2Adapter(props.buildSpec)
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
  <div ref="hostRef" class="g2-host"></div>
</template>

<style scoped>
.g2-host {
  width: 100%;
  height: 100%;
}
</style>
