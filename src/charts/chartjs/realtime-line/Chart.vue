<script setup lang="ts">
/**
 * 实时滑动窗口折线：窗口数据缓冲区在组件内持久持有，
 * 定时滚动（推入新点滑出旧点）后替换 chart.data 增量 update('none')。
 * 直接使用适配器 setup 钩子管理定时器；主题/参数变化经适配器增量应用且不重置数据流。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createChartJsAdapter } from '@/adapters/chartjs'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ChartAdapter } from '@/adapters/types'
import type { ParamValues } from '@/types/params'
import { CHART_PARAMS_KEY } from '@/types/params'
import { buildConfig } from './config'
import { makeInitialData, rollWindow } from './data'

const hostRef = ref<HTMLElement>()
const paramsRef = inject(CHART_PARAMS_KEY, null)

/** 持久窗口缓冲区：参数/主题变化不会重置数据流 */
const buffer = makeInitialData()

let adapter: ChartAdapter | null = null

const buildSnapshotConfig = (theme: ChartTheme, params?: ParamValues) =>
  buildConfig(theme, params, buffer)

onMounted(() => {
  if (!hostRef.value) return
  adapter = createChartJsAdapter(buildSnapshotConfig, ({ chart, getParams }) => {
    let elapsed = 0
    const timer = window.setInterval(() => {
      const p = getParams()
      const interval = typeof p.refreshMs === 'number' ? p.refreshMs : 1000
      elapsed += 1000
      if (elapsed < interval) return
      elapsed = 0
      rollWindow(buffer)
      chart.data.labels = [...buffer.labels]
      chart.data.datasets.forEach((ds, i) => {
        ds.data = [...buffer.series[i]]
      })
      chart.update('none')
    }, 1000)
    return () => window.clearInterval(timer)
  })
  adapter.mount(hostRef.value)
  if (paramsRef?.value) adapter.update?.(paramsRef.value)
})

// 参数面板变化：增量应用（适配器内部合并 options 后 update，不销毁、不重置数据流）
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
  <div ref="hostRef" class="realtime-host"></div>
</template>

<style scoped>
.realtime-host {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
