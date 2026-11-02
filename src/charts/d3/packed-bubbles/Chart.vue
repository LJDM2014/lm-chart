<script setup lang="ts">
/**
 * D3 打包气泡图：手写实现（d3-hierarchy pack + d3-selection）。
 * ResizeObserver 自适应 + 主题变化重绘；参数变化走增量更新：
 * 以新 padding 重跑 pack 布局后经 data join 复用已有 DOM 更新半径与位置（不重建）。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { select, type Selection } from 'd3-selection'
import { hierarchy, pack } from 'd3-hierarchy'
import type { HierarchyCircularNode } from 'd3-hierarchy'

import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import { useThemeStore } from '@/stores/theme'
import { CHART_PARAMS_KEY } from '@/types/params'
import type { ParamValues } from '@/types/params'
import { APP_GROUPS, APP_USAGE } from './data'
import { buildRenderConfig, type PackedRenderConfig } from './config'

interface BubbleDatum {
  name: string
  group: string
  value: number
}
type BubbleNode = HierarchyCircularNode<BubbleDatum>

const hostRef = ref<HTMLElement>()
/** 详情页参数面板注入（独立使用图表组件时为 null） */
const paramsRef = inject(CHART_PARAMS_KEY, null)

let svgRoot: Selection<SVGSVGElement, null, HTMLElement, unknown> | null = null
let circleG: Selection<SVGGElement, null, SVGSVGElement, unknown> | null = null
let labelG: Selection<SVGGElement, null, SVGSVGElement, unknown> | null = null
let resizeObserver: ResizeObserver | null = null
let unwatchTheme: (() => void) | null = null

const groupIndex = (group: string) => Math.max(0, APP_GROUPS.indexOf(group as (typeof APP_GROUPS)[number]))

/** 以当前容器尺寸重跑 pack 布局 */
function runPack(width: number, height: number, cfg: PackedRenderConfig): BubbleNode {
  const root = hierarchy<BubbleDatum>({ name: 'root', group: '', value: 0 }, (d) =>
    d.name === 'root' ? APP_USAGE : undefined,
  )
    .sum((d) => (d.name === 'root' ? 0 : d.value))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  return pack<BubbleDatum>().size([width, height]).padding(cfg.padding)(root)
}

function render(host: HTMLElement, theme: ChartTheme, params: ParamValues | undefined) {
  const width = host.clientWidth || 600
  const height = host.clientHeight || 400
  const cfg = buildRenderConfig(theme, params)
  const root = runPack(width, height, cfg)
  const leaves = root.leaves() as BubbleNode[]

  svgRoot = select<HTMLElement, unknown>(host)
    .selectAll<SVGSVGElement, null>('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  // 气泡层与标签层（标签在气泡之上）
  circleG = svgRoot.selectAll<SVGGElement, null>('g.bubbles').data([null]).join('g').attr('class', 'bubbles')
  labelG = svgRoot.selectAll<SVGGElement, null>('g.labels').data([null]).join('g').attr('class', 'labels')

  // 悬停原生提示
  circleG
    .selectAll<SVGCircleElement, BubbleNode>('circle')
    .data(leaves, (d) => d.data.name)
    .join((enter) => {
      const c = enter.append('circle').attr('fill-opacity', 0.88).style('cursor', 'pointer')
      c.append('title')
      return c
    })
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.r)
    .attr('fill', (d) => cfg.groupColors[groupIndex(d.data.group) % cfg.groupColors.length])
    .attr('stroke', theme.surface)
    .attr('stroke-width', cfg.strokeWidth)
    .select('title')
    .text((d) => `${d.data.name} · ${d.data.group} · 月活 ${d.data.value} 亿`)

  // 标签：小气泡不显示文字，避免溢出
  labelG
    .selectAll<SVGTextElement, BubbleNode>('text')
    .data(leaves, (d) => d.data.name)
    .join('text')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', (d) => Math.min(14, Math.max(9, d.r / 2.4)))
    .attr('pointer-events', 'none')
    .attr('fill', (d) => (d.r > 26 ? '#ffffff' : cfg.labelFill))
    .text((d) => (cfg.showLabel && d.r > 13 ? d.data.name : ''))
}

/** 参数增量应用：重跑 pack 布局并 join 更新（DOM 复用，不重建） */
function applyParams(params: ParamValues | undefined) {
  const host = hostRef.value
  if (!host || !circleG || !labelG) return
  render(host, getChartTheme(useThemeStore().isDark), params)
}

onMounted(() => {
  const host = hostRef.value
  if (!host) return

  const rerender = () => render(host, getChartTheme(useThemeStore().isDark), paramsRef?.value)
  rerender()

  resizeObserver = new ResizeObserver(rerender)
  resizeObserver.observe(host)

  unwatchTheme = useThemeStore().$subscribe(rerender)
})

watch(
  () => paramsRef?.value,
  (value) => {
    if (value) applyParams(value)
  },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  unwatchTheme?.()
  unwatchTheme = null
  svgRoot?.remove()
  svgRoot = null
  circleG = null
  labelG = null
})
</script>

<template>
  <div ref="hostRef" class="packed-host"></div>
</template>

<style scoped>
.packed-host {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
