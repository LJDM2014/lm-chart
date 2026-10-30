/**
 * 图表注册中心（Registry）
 * - 通过 import.meta.glob 自动聚合所有 src/charts/{lib}/{id}/meta.ts（eager）
 * - 图表组件与 config 源码惰性加载
 * - 路由、画廊列表、搜索索引全部由 Registry 自动生成：新增图表 = 新增一个文件夹
 */
import type { Component } from 'vue'
import type { ChartCategory, ChartLib, ChartMeta } from '@/types/chart'
import { CHART_CATEGORIES, CHART_LIBS, CATEGORY_LABELS, LIB_LABELS } from '@/types/chart'
import type { ControlDef } from '@/types/params'

export interface ChartEntry {
  meta: ChartMeta
  /** 惰性加载的图表渲染组件（供 defineAsyncComponent 使用） */
  component: () => Promise<Component>
  /** config.ts 源码的惰性加载器（详情页源码展示） */
  configSource: () => Promise<string>
}

/** config.ts 作为运行时模块的形状：图表可声明参数面板控件 */
export interface ChartConfigModule {
  controls?: ControlDef[]
}

/** 聚合所有 meta.ts（eager：启动时同步构建索引，代价极小） */
const metaModules = import.meta.glob<{ default: ChartMeta }>('./**/meta.ts', { eager: true })

/** 惰性加载所有图表组件 */
const componentModules = import.meta.glob<Component>('./**/Chart.vue')

/** 惰性加载所有 config.ts 源码字符串 */
const configSourceModules = import.meta.glob<string>('./**/config.ts', {
  query: '?raw',
  import: 'default',
})

/** 惰性加载所有 config.ts 运行时模块（读取参数面板控件声明） */
const configModules = import.meta.glob<ChartConfigModule>('./**/config.ts')

/** 从 meta 模块路径解析 lib 与 id：'./echarts/gradient-bar/meta.ts' -> { lib: 'echarts', id: 'gradient-bar' } */
function parseModulePath(path: string): { lib: ChartLib; id: string } | null {
  const match = path.match(/^\.\/([^/]+)\/([^/]+)\/meta\.ts$/)
  if (!match) return null
  const [, lib, id] = match
  if (!(CHART_LIBS as readonly string[]).includes(lib)) return null
  return { lib: lib as ChartLib, id }
}

const entries = new Map<string, ChartEntry>()

for (const [path, mod] of Object.entries(metaModules)) {
  const parsed = parseModulePath(path)
  if (!parsed) continue
  const { lib, id } = parsed
  const meta = { ...mod.default, lib }
  const componentPath = `./${lib}/${id}/Chart.vue`
  const configPath = `./${lib}/${id}/config.ts`
  const component = componentModules[componentPath]
  const configSource = configSourceModules[configPath]
  if (!component || !configSource) {
    // 缺少 Chart.vue / config.ts 的目录视为未完成的开发中图表，跳过
    continue
  }
  entries.set(`${lib}/${id}`, { meta, component, configSource })
}

const allEntries: ChartEntry[] = [...entries.values()]

/** 全部图表 */
export function getAllCharts(): ChartEntry[] {
  return allEntries
}

/** 精选图表（首页展示） */
export function getFeaturedCharts(): ChartEntry[] {
  return allEntries.filter((entry) => entry.meta.featured)
}

/** 按 lib + id 查找 */
export function getChart(lib: string, id: string): ChartEntry | undefined {
  return entries.get(`${lib}/${id}`)
}

/** 按分类查找 */
export function getChartsByCategory(category: ChartCategory): ChartEntry[] {
  return allEntries.filter((entry) => entry.meta.category === category)
}

/** 惰性加载图表的 config 模块（参数面板控件声明），无 config 时返回 undefined */
export function getConfigModule(lib: string, id: string): Promise<ChartConfigModule> | undefined {
  return configModules[`./${lib}/${id}/config.ts`]?.()
}

/** 按所属库查找 */
export function getChartsByLib(lib: ChartLib): ChartEntry[] {
  return allEntries.filter((entry) => entry.meta.lib === lib)
}

/** 模糊搜索：标题 / 标签 / 分类 / 库 / 描述 / id */
export function searchCharts(keyword: string): ChartEntry[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return []
  return allEntries.filter(({ meta }) => {
    const haystack = [
      meta.title,
      meta.id,
      meta.description,
      ...meta.tags,
      CATEGORY_LABELS[meta.category],
      LIB_LABELS[meta.lib],
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(kw)
  })
}

/** 每个分类的图表数量（首页分类入口卡片） */
export function getCategoryCounts(): Record<ChartCategory, number> {
  const counts = Object.fromEntries(CHART_CATEGORIES.map((c) => [c, 0])) as Record<
    ChartCategory,
    number
  >
  for (const { meta } of allEntries) {
    counts[meta.category] += 1
  }
  return counts
}

/** 每个库的图表数量 */
export function getLibCounts(): Record<ChartLib, number> {
  const counts = Object.fromEntries(CHART_LIBS.map((l) => [l, 0])) as Record<ChartLib, number>
  for (const { meta } of allEntries) {
    counts[meta.lib] += 1
  }
  return counts
}
