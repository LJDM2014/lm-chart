<script setup lang="ts">
/**
 * D3 平行坐标图：手写实现（d3-scale + d3-axis + d3-selection），
 * 每个维度一条纵向坐标轴，折线连接各维度得分，悬停高亮单条折线。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { axisLeft, axisBottom, type Axis } from 'd3-axis'
import { scaleLinear, scalePoint, type ScaleLinear, type ScalePoint } from 'd3-scale'

import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import { useThemeStore } from '@/stores/theme'
import { CHART_PARAMS_KEY } from '@/types/params'
import type { ParamValues } from '@/types/params'
import { dimensions, languages } from './data'
import { buildRenderConfig } from './config'

const hostRef = ref<HTMLElement>()
/** 详情页参数面板注入（独立使用图表组件时为 null） */
const paramsRef = inject(CHART_PARAMS_KEY, null)
let resizeObserver: ResizeObserver | null = null
let unwatchTheme: (() => void) | null = null

type XScale = ScalePoint<string>
type YScale = ScaleLinear<number, number>

function render(host: HTMLElement, theme: ChartTheme, params?: ParamValues) {
  const width = host.clientWidth || 600
  const height = host.clientHeight || 400
  const cfg = buildRenderConfig(theme, params)
  const margin = cfg.margin
  const innerW = Math.max(80, width - margin.left - margin.right)
  const innerH = Math.max(80, height - margin.top - margin.bottom)

  const svg = select<HTMLElement, unknown>(host)
    .selectAll<SVGSVGElement, unknown>('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height)

  svg.selectAll('*').remove()

  const x: XScale = scalePoint<string>().domain(dimensions).range([0, innerW]).padding(0.6)
  const y: YScale = scaleLinear().domain([0, 100]).range([innerH, 0])

  const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

  // 坐标轴
  const axisG = g
    .append('g')
    .selectAll<SVGGElement, string>('g')
    .data(dimensions)
    .join('g')
    .attr('transform', (d) => `translate(${x(d) ?? 0}, 0)`)

  const axisFactory = (): Axis<number> => axisLeft<number>(y).ticks(cfg.axisTickCount)
  axisG.each(function (d) {
    select(this).call(axisFactory())
    select(this).append('text')
      .text(d)
      .attr('y', -12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', cfg.dimLabelFill)
  })

  axisG
    .selectAll<SVGLineElement, unknown>('line')
    .attr('stroke', theme.splitLine)
  axisG
    .selectAll<SVGTextElement, unknown>('text')
    .filter((d) => typeof d === 'number')
    .attr('fill', cfg.tickLabelFill)
    .attr('font-size', cfg.tickFontSize)

  const linePath = (scores: number[]) =>
    scores.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(dimensions[i]) ?? 0},${y(v)}`).join(' ')

  const paths = g
    .append('g')
    .selectAll<SVGPathElement, (typeof languages)[number]>('path')
    .data(languages)
    .join('path')
    .attr('d', (d) => linePath(d.scores))
    .attr('fill', 'none')
    .attr('stroke', (_d, i) => theme.palette[i % theme.palette.length])
    .attr('stroke-width', cfg.lineWidth)
    .attr('stroke-opacity', cfg.lineOpacity)
    .style('cursor', 'pointer')

  // 悬停高亮
  paths
    .on('mouseenter', function () {
      paths.attr('stroke-opacity', 0.12).attr('stroke-width', 1.5)
      select(this).attr('stroke-opacity', 1).attr('stroke-width', cfg.hoverLineWidth)
    })
    .on('mouseleave', () => {
      paths.attr('stroke-opacity', cfg.lineOpacity).attr('stroke-width', cfg.lineWidth)
    })

  // 名称标签（最右侧）
  g.append('g')
    .selectAll<SVGTextElement, (typeof languages)[number]>('text')
    .data(languages)
    .join('text')
    .attr('x', () => (x(dimensions[dimensions.length - 1]) ?? 0) + 8)
    .attr('y', (d) => y(d.scores[d.scores.length - 1]) + 4)
    .text((d) => d.name)
    .attr('font-size', cfg.nameFontSize)
    .attr('fill', cfg.nameLabelFill)
    .attr('display', cfg.showName ? null : 'none')

  // x 轴底部维度标签兜底（scalePoint 位置）
  g.append('g')
    .attr('transform', `translate(0, ${innerH})`)
    .call(axisBottom(x).tickSize(0).tickPadding(10))
    .call((sel) => {
      sel.selectAll('line').attr('stroke', theme.axisLine)
      sel.select('path').attr('stroke', theme.axisLine)
      sel.selectAll('text').attr('fill', theme.textSecondary).attr('font-size', 11)
    })
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

watch(() => paramsRef?.value, (value) => {
  if (value && hostRef.value) {
    render(hostRef.value, getChartTheme(useThemeStore().isDark), value)
  }
})

onBeforeUnmount(() => {
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
