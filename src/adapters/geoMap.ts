/**
 * 中国地图 GeoJSON 加载助手：运行时 fetch public/geo/china.json 并注册到 ECharts，
 * 全局只加载一次（多张 geo 图表共享同一 Promise）。
 * 地图数据不参与构建打包（位于 public/），保持主包与图表 chunk 轻量。
 */
import { registerMap } from 'echarts/core'

/** 注册到 ECharts 的地图名称 */
export const CHINA_MAP_NAME = 'china'

let loadPromise: Promise<void> | null = null

/** 确保「china」地图已注册；可在多个图表的挂载前插件中安全复用 */
export function ensureChinaMap(): Promise<void> {
  if (!loadPromise) {
    loadPromise = fetch(`${import.meta.env.BASE_URL}geo/china.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`加载中国地图失败：${res.status}`)
        return res.json() as Promise<GeoJSON.FeatureCollection>
      })
      .then((geo) => {
        registerMap(CHINA_MAP_NAME, geo as never)
      })
      .catch((err) => {
        // 失败后重置 Promise，允许下次挂载重试
        loadPromise = null
        throw err
      })
  }
  return loadPromise
}
