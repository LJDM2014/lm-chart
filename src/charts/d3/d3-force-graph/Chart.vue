<script setup lang="ts">
/**
 * D3 力导向关系图：手写实现（d3-force + d3-selection + d3-drag + d3-zoom），
 * ResizeObserver 自适应 + 主题变化重绘 + 卸载时停止模拟防止泄漏。
 * 参数面板变化走增量更新：仅调整力模型参数并重启模拟，不重建 DOM。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { select, type Selection } from 'd3-selection'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type ForceLink,
  type ForceManyBody,
  type Simulation,
} from 'd3-force'
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force'
import { drag, type D3DragEvent } from 'd3-drag'
import { zoom, type D3ZoomEvent } from 'd3-zoom'

import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import { useThemeStore } from '@/stores/theme'
import { CHART_PARAMS_KEY } from '@/types/params'
import type { ParamValues } from '@/types/params'
import { techLinks, techNodes, type TechNodeDatum } from './data'
import { buildRenderConfig, type D3ForceRenderConfig } from './config'

interface SimNode extends SimulationNodeDatum, TechNodeDatum {}
type SimLink = SimulationLinkDatum<SimNode>

type LinkForce = ForceLink<SimNode, SimLink>
type ChargeForce = ForceManyBody<SimNode>
type NodeGroupSelection = Selection<SVGGElement, SimNode, SVGGElement, unknown>
type NodeLabelSelection = Selection<SVGTextElement, SimNode, SVGGElement, unknown>

const hostRef = ref<HTMLElement>()
/** 详情页参数面板注入（独立使用图表组件时为 null） */
const paramsRef = inject(CHART_PARAMS_KEY, null)

let simulation: Simulation<SimNode, SimLink> | null = null
let linkForce: LinkForce | null = null
let chargeForce: ChargeForce | null = null
let nodeLabels: NodeLabelSelection | null = null
let resizeObserver: ResizeObserver | null = null
let unwatchTheme: (() => void) | null = null

function createNodeLabels(nodeSel: NodeGroupSelection, cfg: D3ForceRenderConfig): NodeLabelSelection {
  return nodeSel
    .append('text')
    .text((d) => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => d.size + 14)
    .attr('font-size', cfg.labelFontSize)
    .attr('fill', cfg.labelFill)
}

function render(host: HTMLElement, theme: ChartTheme, params: ParamValues | undefined) {
  const width = host.clientWidth || 600
  const height = host.clientHeight || 400
  const cfg = buildRenderConfig(theme, params)

  // 重建前停止旧模拟，防止多个模拟同时运行
  simulation?.stop()

  // 深拷贝，避免模拟过程污染演示数据
  const nodes: SimNode[] = techNodes.map((n) => ({ ...n }))
  const links: SimLink[] = techLinks.map((l) => ({ ...l }))

  const svg = select<HTMLElement, unknown>(host)
    .selectAll<SVGSVGElement, unknown>('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height)

  svg.selectAll('*').remove()

  const g = svg.append('g')

  // 缩放
  svg.call(
    zoom<SVGSVGElement, null>()
      .scaleExtent(cfg.scaleExtent)
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, null>) => {
        g.attr('transform', event.transform.toString())
      }),
  )

  const linkSel = g
    .append('g')
    .selectAll<SVGLineElement, SimLink>('line')
    .data(links)
    .join('line')
    .attr('stroke', cfg.linkStroke)
    .attr('stroke-width', cfg.linkWidth)
    .attr('stroke-opacity', cfg.linkOpacity)

  const nodeSel = g
    .append('g')
    .selectAll<SVGGElement, SimNode>('g')
    .data(nodes)
    .join('g')
    .style('cursor', 'grab')

  nodeSel
    .append('circle')
    .attr('r', (d) => d.size)
    .attr('fill', (d) => theme.palette[d.group % theme.palette.length])
    .attr('fill-opacity', 0.9)

  nodeLabels = createNodeLabels(nodeSel, cfg)
  nodeLabels.attr('display', cfg.showLabel ? null : 'none')

  nodeSel.call(
    drag<SVGGElement, SimNode>()
      .on(
        'start',
        (event: D3DragEvent<SVGGElement, SimNode, unknown>, d) => {
          if (!event.active) simulation?.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        },
      )
      .on('drag', (event: D3DragEvent<SVGGElement, SimNode, unknown>, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event: D3DragEvent<SVGGElement, SimNode, unknown>, d) => {
        if (!event.active) simulation?.alphaTarget(0)
        d.fx = null
        d.fy = null
      }),
  )

  simulation = forceSimulation<SimNode>(nodes)
    .force(
      'link',
      (linkForce = forceLink<SimNode, SimLink>(links)
        .id((d) => d.id)
        .distance(cfg.linkDistance)),
    )
    .force('charge', (chargeForce = forceManyBody<SimNode>().strength(cfg.chargeStrength)))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide<SimNode>().radius((d) => d.size + 8))

  simulation.on('tick', () => {
    linkSel
      .attr('x1', (d) => (d.source as SimNode).x ?? 0)
      .attr('y1', (d) => (d.source as SimNode).y ?? 0)
      .attr('x2', (d) => (d.target as SimNode).x ?? 0)
      .attr('y2', (d) => (d.target as SimNode).y ?? 0)
    nodeSel.attr('transform', (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`)
  })
}

/** 参数增量应用：只更新力模型与标签显隐，随后重启模拟（不重建 DOM） */
function applyParams(params: ParamValues | undefined) {
  if (!simulation || !linkForce || !chargeForce || !nodeLabels) return
  const cfg = buildRenderConfig(getChartTheme(useThemeStore().isDark), params)
  linkForce.distance(cfg.linkDistance)
  chargeForce.strength(cfg.chargeStrength)
  nodeLabels.attr('display', cfg.showLabel ? null : 'none')
  simulation.alpha(0.6).restart()
}

onMounted(() => {
  const host = hostRef.value
  if (!host) return

  const rerender = () =>
    render(host, getChartTheme(useThemeStore().isDark), paramsRef?.value)
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
  simulation?.stop()
  simulation = null
  linkForce = null
  chargeForce = null
  nodeLabels = null
  resizeObserver?.disconnect()
  resizeObserver = null
  unwatchTheme?.()
  unwatchTheme = null
})
</script>

<template>
  <div ref="hostRef" class="d3-host"></div>
</template>

<style scoped>
.d3-host {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
