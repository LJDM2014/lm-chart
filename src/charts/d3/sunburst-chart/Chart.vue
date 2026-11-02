<script setup lang="ts">
/**
 * D3 手写旭日图：d3-hierarchy（hierarchy + partition）计算径向布局 + d3-shape arc 绘制。
 * ResizeObserver 自适应 + 主题变化重绘 + 卸载时清理。
 * 交互：点击弧段高亮其祖先与后代链路（其余降透明度），再次点击或点击中心重置；
 * 参数面板变化（内径比例/层级/圆角/标签）触发全量重绘。
 */
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { select } from 'd3-selection'
import { hierarchy, partition, type HierarchyRectangularNode } from 'd3-hierarchy'
import { arc as d3arc } from 'd3-shape'

import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import { useThemeStore } from '@/stores/theme'
import { CHART_PARAMS_KEY } from '@/types/params'
import type { ParamValues } from '@/types/params'
import { budgetTree, type BudgetNode } from './data'
import { buildRenderConfig } from './config'

type SunNode = HierarchyRectangularNode<BudgetNode>

const hostRef = ref<HTMLElement>()
const paramsRef = inject(CHART_PARAMS_KEY, null)

let resizeObserver: ResizeObserver | null = null
let unwatchTheme: (() => void) | null = null
/** 当前点击选中的节点（null = 未选中） */
let selected: SunNode | null = null

/** 收集选中链路：祖先 + 自身 + 全部后代 */
function keepSet(node: SunNode): Set<SunNode> {
  const set = new Set<SunNode>()
  let cur: SunNode | null = node
  while (cur) {
    set.add(cur)
    cur = cur.parent
  }
  node.descendants().forEach((d) => set.add(d))
  return set
}

function render(host: HTMLElement, theme: ChartTheme, params: ParamValues | undefined) {
  const cfg = buildRenderConfig(theme, params)
  const width = host.clientWidth || 600
  const height = host.clientHeight || 420
  const radius = Math.min(width, height) / 2 - 24
  const innerRadius = radius * cfg.innerRatio

  const svg = select<HTMLElement, unknown>(host)
    .selectAll<SVGSVGElement, unknown>('svg')
    .data([null])
    .join('svg')
    .attr('width', width)
    .attr('height', height)
  svg.selectAll('*').remove()
  const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`)

  // partition 默认 size 为 [1,1]，需显式指定角度域 [0, 2π] 与半径域 [0, 3]（对应三层）
  const root = partition<BudgetNode>()
    .size([Math.PI * 2, 3])
    (hierarchy<BudgetNode>(budgetTree).sum((d) => d.value ?? 0))

  /** 半径比例尺：分区坐标 y（0..最大深度）映射到 [内径, 外径] */
  const yMax = 3
  const rScale = (y: number) => innerRadius + (y / yMax) * (radius - innerRadius)

  const arcGen = d3arc<SunNode>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => rScale(d.y0))
    .outerRadius((d) => rScale(d.y1))
    .cornerRadius(cfg.cornerRadius)

  const keep = selected ? keepSet(selected) : null
  /** 一级事业群名 → 色板索引，后代继承父级色相 */
  const rootColorIndex = new Map<string, number>()
  ;(root.children ?? []).forEach((child, i) => rootColorIndex.set(child.data.name, i))
  /** 一级事业群根节点，用于确定后代继承的色相 */
  const topRootOf = (d: SunNode): SunNode => {
    let cur = d
    while (cur.depth > 1) cur = cur.parent as SunNode
    return cur
  }

  const nodes = root.descendants().filter((d) => d.depth >= 1 && d.depth <= cfg.maxDepth)
  const paths = g
    .selectAll<SVGPathElement, SunNode>('path')
    .data(nodes)
    .join('path')
    .attr('d', (d) => arcGen(d) ?? '')
    .attr('fill', (d) => {
      const idx = rootColorIndex.get(topRootOf(d).data.name) ?? 0
      return cfg.palette[idx % cfg.palette.length]
    })
    .attr('stroke', theme.surface)
    .attr('stroke-width', 1)
    .style('cursor', 'pointer')

  const applyOpacity = () => {
    paths.attr('fill-opacity', (d) => {
      const base = 0.95 - (d.depth - 1) * 0.22
      if (!keep) return Math.max(base, 0.25)
      return keep.has(d) ? Math.max(base, 0.3) : 0.08
    })
  }
  applyOpacity()

  paths.append('title').text((d) => `${d.data.name}：${d.value ?? 0} 亿元`)

  paths.on('click', (_event, d) => {
    selected = selected === d ? null : d
    // 选中状态变化影响所有弧段的透明度，重算 keep 集合
    const nextKeep = selected ? keepSet(selected) : null
    paths.attr('fill-opacity', (node) => {
      const base = 0.95 - (node.depth - 1) * 0.22
      if (!nextKeep) return Math.max(base, 0.25)
      return nextKeep.has(node) ? Math.max(base, 0.3) : 0.08
    })
  })

  // 弧段标签：角度足够大时显示，沿切线旋转
  const labels = g
    .selectAll<SVGTextElement, SunNode>('text')
    .data(cfg.showLabel ? nodes.filter((d) => d.x1 - d.x0 > 0.22) : [])
    .join('text')
    .each(function (d) {
      const mid = (d.x0 + d.x1) / 2
      const r = (rScale(d.y0) + rScale(d.y1)) / 2
      const flip = mid > Math.PI
      select(this)
        .attr(
          'transform',
          `rotate(${(mid * 180) / Math.PI - 90}) translate(${r}) ${flip ? 'rotate(180)' : ''}`,
        )
        .attr('text-anchor', 'middle')
    })
    .text((d) => d.data.name)
    .attr('fill', cfg.labelFill)
    .attr('font-size', 11)
    .attr('dy', '0.35em')
    .attr('pointer-events', 'none')

  // 中心点击重置
  g.append('circle')
    .attr('r', innerRadius)
    .attr('fill', 'transparent')
    .style('cursor', selected ? 'pointer' : 'default')
    .on('click', () => {
      if (!selected) return
      selected = null
      paths.attr('fill-opacity', (d) => Math.max(0.95 - (d.depth - 1) * 0.22, 0.25))
    })
  void labels
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
    if (value) {
      selected = null
      if (hostRef.value) render(hostRef.value, getChartTheme(useThemeStore().isDark), value)
    }
  },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  unwatchTheme?.()
  unwatchTheme = null
  selected = null
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
