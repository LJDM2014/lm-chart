<script setup lang="ts">
/**
 * D3 手写河流图：d3-shape（stack + area + 曲线工厂）绘制流式堆叠面积。
 * ResizeObserver 自适应 + 主题变化重绘 + 卸载时清理 observer。
 * 参数面板变化走增量更新：曲线/偏移/透明度只重算并更新已有 path 的 d 与填充属性，不重建 DOM。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { select, type Selection } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import {
  stack,
  stackOffsetSilhouette,
  stackOffsetNone,
  area,
  curveBasis,
  curveMonotoneX,
  curveStep,
  type CurveFactory,
} from 'd3-shape'

import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import { useThemeStore } from '@/stores/theme'
import { CHART_PARAMS_KEY } from '@/types/params'
import type { ParamValues } from '@/types/params'
import { years, energySources, generationBySource, type EnergySource } from './data'
import { buildRenderConfig, type StreamRenderConfig, type StreamCurveType } from './config'

type GenRow = { year: number } & Record<EnergySource, number>
interface StreamPoint {
  x: number
  y0: number
  y1: number
}
interface StreamSeries {
  name: EnergySource
  points: StreamPoint[]
}

type SvgSelection = Selection<SVGSVGElement, null, HTMLElement, unknown>
type PathSelection = Selection<SVGPathElement, StreamSeries, SVGGElement, unknown>
type LabelSelection = Selection<SVGTextElement, StreamSeries, SVGGElement, unknown>

const hostRef = ref<HTMLElement>()
const paramsRef = inject(CHART_PARAMS_KEY, null)

let resizeObserver: ResizeObserver | null = null
let unwatchTheme: (() => void) | null = null
let svgSel: SvgSelection | null = null
let pathSel: PathSelection | null = null
let labelSel: LabelSelection | null = null

const curveFactories: Record<StreamCurveType, CurveFactory> = {
  basis: curveBasis,
  monotone: curveMonotoneX,
  step: curveStep,
}

/** 计算堆叠布局：行数据 → stack（offset 可切换）→ 屏幕坐标点集 */
function computeSeries(cfg: StreamRenderConfig, width: number, height: number) {
  const margin = { top: 20, right: 28, bottom: 32, left: 40 }
  const rows: GenRow[] = years.map((y, i) => {
    const row = { year: y } as GenRow
    energySources.forEach((s) => {
      row[s] = generationBySource[s][i]
    })
    return row
  })

  const series = stack<GenRow, EnergySource>()
    .keys(energySources)
    .offset(cfg.offsetMode === 'silhouette' ? stackOffsetSilhouette : stackOffsetNone)(rows)

  const x = scaleLinear()
    .domain([years[0], years[years.length - 1]])
    .range([margin.left, width - margin.right])
    .nice()

  let valueMin = Infinity
  let valueMax = -Infinity
  series.forEach((s) =>
    s.forEach((p) => {
      valueMin = Math.min(valueMin, p[0])
      valueMax = Math.max(valueMax, p[1])
    }),
  )
  const y = scaleLinear()
    .domain([valueMin, valueMax])
    .range([height - margin.bottom, margin.top])
    .nice()

  const streamSeries: StreamSeries[] = series.map((s) => ({
    name: s.key,
    points: s.map((p, i) => ({ x: x(years[i]), y0: y(p[0]), y1: y(p[1]) })),
  }))
  return { x, margin, streamSeries }
}

/** 面积生成器：曲线样式由参数决定 */
function makeArea(cfg: StreamRenderConfig) {
  return area<StreamPoint>()
    .x((d) => d.x)
    .y0((d) => d.y0)
    .y1((d) => d.y1)
    .curve(curveFactories[cfg.curveType])
}

function render(host: HTMLElement, theme: ChartTheme, params: ParamValues | undefined) {
  const cfg = buildRenderConfig(theme, params)
  const width = host.clientWidth || 600
  const height = host.clientHeight || 420
  const { x, margin, streamSeries } = computeSeries(cfg, width, height)

  const svg = select<HTMLElement, unknown>(host)
    .selectAll<SVGSVGElement, unknown>('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height)
  svg.selectAll('*').remove()
  svgSel = svg

  // 底部年份轴
  const axisG = svg.append('g')
  axisG
    .append('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', height - margin.bottom)
    .attr('y2', height - margin.bottom)
    .attr('stroke', cfg.axisStroke)
    .attr('stroke-width', 1)
  axisG
    .selectAll<SVGTextElement, number>('text')
    .data([...years])
    .join('text')
    .attr('x', (d) => x(d))
    .attr('y', height - margin.bottom + 16)
    .attr('text-anchor', 'middle')
    .text((d) => String(d))
    .attr('fill', cfg.labelFill)
    .attr('font-size', 10)

  const areaGen = makeArea(cfg)

  // 流带：每条系列一个面积 path，描边用背景色制造层次分隔
  pathSel = svg
    .append('g')
    .selectAll<SVGPathElement, StreamSeries>('path')
    .data(streamSeries)
    .join('path')
    .attr('d', (d) => areaGen(d.points) ?? '')
    .attr('fill', (_d, i) => cfg.seriesFill[i % cfg.seriesFill.length])
    .attr('fill-opacity', cfg.areaOpacity)
    .attr('stroke', cfg.strokeColor)
    .attr('stroke-width', 1)
  pathSel.append('title').text((d) => `${d.name} 发电量（TWh）`)

  // 系列标签：放在厚度最大处，过窄的流带不显示
  labelSel = svg
    .append('g')
    .selectAll<SVGTextElement, StreamSeries>('text')
    .data(streamSeries)
    .join('text')
  applyLabels(cfg)
}

/** 根据最新布局更新标签位置与可见性（标签数据随系列 join，位置取厚度最大点） */
function applyLabels(cfg: StreamRenderConfig) {
  labelSel
    ?.each(function (d) {
      let best = d.points[0]
      let bestThick = -1
      d.points.forEach((p) => {
        const thick = Math.abs(p.y0 - p.y1)
        if (thick > bestThick) {
          bestThick = thick
          best = p
        }
      })
      const visible = cfg.showLabel && bestThick > 9
      const el = select(this)
      if (!visible) {
        el.attr('display', 'none')
        return
      }
      el.attr('display', null)
        .attr('transform', `translate(${best.x}, ${(best.y0 + best.y1) / 2})`)
        .text(d.name)
    })
    .attr('text-anchor', 'middle')
    .attr('fill', cfg.labelFill)
    .attr('font-size', 11)
    .attr('font-weight', 600)
    .attr('pointer-events', 'none')
}

/** 增量应用参数：重算布局后仅更新 path 几何 / 填充与标签 */
function applyParams(params: ParamValues | undefined) {
  if (!svgSel || !hostRef.value) return
  const theme = getChartTheme(useThemeStore().isDark)
  const cfg = buildRenderConfig(theme, params)
  const width = hostRef.value.clientWidth || 600
  const height = hostRef.value.clientHeight || 420
  const { streamSeries } = computeSeries(cfg, width, height)
  const areaGen = makeArea(cfg)

  pathSel
    ?.data(streamSeries)
    .attr('d', (d) => areaGen(d.points) ?? '')
    .attr('fill', (_d, i) => cfg.seriesFill[i % cfg.seriesFill.length])
    .attr('fill-opacity', cfg.areaOpacity)
  pathSel?.select('title').text((d) => `${d.name} 发电量（TWh）`)
  labelSel?.data(streamSeries)
  applyLabels(cfg)
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
  pathSel = null
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
