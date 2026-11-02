<script setup lang="ts">
/**
 * D3 手写弦图：d3-chord 计算弦布局 + d3-shape（arc/ribbon）绘制。
 * ResizeObserver 自适应 + 主题变化重绘 + 卸载时清理 observer。
 * 参数面板变化走增量更新：padAngle/排序需重算布局（更新 path 属性），透明度与标签直接改属性。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { select, type Selection } from 'd3-selection'
import { chord, ribbon } from 'd3-chord'
import type { Chord, ChordGroup, ChordSubgroup } from 'd3-chord'
import { arc as d3arc } from 'd3-shape'

import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import { useThemeStore } from '@/stores/theme'
import { CHART_PARAMS_KEY } from '@/types/params'
import type { ParamValues } from '@/types/params'
import { migrationMatrix, regions } from './data'
import { buildRenderConfig, type ChordRenderConfig } from './config'

type SvgSelection = Selection<SVGSVGElement, null, HTMLElement, unknown>
type GroupSelection = Selection<SVGGElement, ChordGroup, SVGGElement, unknown>
type RibbonSelection = Selection<SVGPathElement, Chord, SVGGElement, unknown>

const hostRef = ref<HTMLElement>()
const paramsRef = inject(CHART_PARAMS_KEY, null)

let resizeObserver: ResizeObserver | null = null
let unwatchTheme: (() => void) | null = null
let svgSel: SvgSelection | null = null
let ribbonSel: RibbonSelection | null = null
let groupSel: GroupSelection | null = null
let labelSel: Selection<SVGTextElement, ChordGroup, SVGGElement, unknown> | null = null

function render(host: HTMLElement, theme: ChartTheme, params: ParamValues | undefined) {
  const cfg = buildRenderConfig(theme, params)
  const size = Math.min(host.clientWidth || 600, host.clientHeight || 420)
  const outerRadius = size / 2 - 28
  const innerRadius = outerRadius - 22

  const svg = select<HTMLElement, unknown>(host)
    .selectAll<SVGSVGElement, unknown>('svg')
    .data([null])
    .join('svg')
    .attr('width', host.clientWidth || 600)
    .attr('height', host.clientHeight || 420)
  svg.selectAll('*').remove()
  svgSel = svg

  const g = svg.append('g').attr('transform', `translate(${(host.clientWidth || 600) / 2}, ${(host.clientHeight || 420) / 2})`)

  const layout = chord().padAngle(cfg.padAngle)
  if (cfg.sortMode === 'flow') {
    layout.sortGroups((a, b) => b - a)
  } else {
    layout.sortGroups(null)
  }
  const chords = layout(migrationMatrix)

  const groupArc = d3arc<ChordGroup>().innerRadius(innerRadius).outerRadius(outerRadius)

  // 外圈弧段（迁入 + 迁出总量）
  groupSel = g
    .append('g')
    .selectAll<SVGGElement, ChordGroup>('g')
    .data(chords.groups)
    .join('g')
  groupSel
    .append('path')
    .attr('d', (d) => groupArc(d) ?? '')
    .attr('fill', (d) => cfg.groupFill[d.index % cfg.groupFill.length])
    .attr('fill-opacity', 0.92)
    .append('title')
    .text((d) => `${regions[d.index]}：流出 ${d.value} 万人`)

  // 内部弦（两地间流量）
  const ribbonPath = ribbon<Chord, ChordSubgroup>().radius(innerRadius)
  ribbonSel = g
    .append('g')
    .selectAll<SVGPathElement, Chord>('path')
    .data(chords)
    .join('path')
    .attr('d', (d) => ribbonPath(d) ?? '')
    .attr('fill', (d) => cfg.groupFill[d.source.index % cfg.groupFill.length])
    .attr('fill-opacity', cfg.chordOpacity)
    .attr('stroke', cfg.chordStroke)
    .attr('stroke-width', 0.5)
  ribbonSel.append('title').text((d) => `${regions[d.source.index]} → ${regions[d.target.index]}：${d.source.value} 万人`)

  // 地区标签
  const labelAnchor = (d: ChordGroup) => ((d.startAngle + d.endAngle) / 2 > Math.PI ? 'end' : 'start') as 'end' | 'start'
  labelSel = groupSel
    .append('text')
    .each(function (d) {
      const mid = (d.startAngle + d.endAngle) / 2
      select(this)
        .attr('transform', `rotate(${(mid * 180) / Math.PI - 90}) translate(${outerRadius + 10}) ${mid > Math.PI ? 'rotate(180)' : ''}`)
        .attr('text-anchor', labelAnchor(d))
    })
    .text((d) => regions[d.index])
    .attr('fill', cfg.labelFill)
    .attr('font-size', 12)
    .attr('dy', '0.35em')
  applyLabelVisibility(cfg)
}

/** 增量应用参数：重算弦布局（padAngle/排序变化影响几何），透明度与标签直接改属性 */
function applyParams(params: ParamValues | undefined) {
  if (!svgSel || !hostRef.value) return
  const theme = getChartTheme(useThemeStore().isDark)
  const cfg = buildRenderConfig(theme, params)
  const size = Math.min(hostRef.value.clientWidth || 600, hostRef.value.clientHeight || 420)
  const outerRadius = size / 2 - 28
  const innerRadius = outerRadius - 22

  const layout = chord().padAngle(cfg.padAngle)
  if (cfg.sortMode === 'flow') layout.sortGroups((a, b) => b - a)
  else layout.sortGroups(null)
  const chords = layout(migrationMatrix)

  const groupArc = d3arc<ChordGroup>().innerRadius(innerRadius).outerRadius(outerRadius)
  const ribbonPath = ribbon<Chord, ChordSubgroup>().radius(innerRadius)

  groupSel
    ?.data(chords.groups)
    .select('path')
    .attr('d', (d) => groupArc(d) ?? '')
    .attr('fill', (d) => cfg.groupFill[d.index % cfg.groupFill.length])
    .select('title')
    .text((d) => `${regions[d.index]}：流出 ${d.value} 万人`)

  ribbonSel
    ?.data(chords)
    .attr('d', (d) => ribbonPath(d) ?? '')
    .attr('fill', (d) => cfg.groupFill[d.source.index % cfg.groupFill.length])
    .attr('fill-opacity', cfg.chordOpacity)
  ribbonSel
    ?.select('title')
    .text((d) => `${regions[d.source.index]} → ${regions[d.target.index]}：${d.source.value} 万人`)

  labelSel
    ?.data(chords.groups)
    .each(function (d) {
      const mid = (d.startAngle + d.endAngle) / 2
      select(this)
        .attr('transform', `rotate(${(mid * 180) / Math.PI - 90}) translate(${outerRadius + 10}) ${mid > Math.PI ? 'rotate(180)' : ''}`)
        .attr('text-anchor', mid > Math.PI ? 'end' : 'start')
    })
    .text((d) => regions[d.index])
  applyLabelVisibility(cfg)
}

function applyLabelVisibility(cfg: ChordRenderConfig) {
  labelSel?.attr('display', cfg.showLabel ? null : 'none')
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
  svgSel = null
  ribbonSel = null
  groupSel = null
  labelSel = null
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
