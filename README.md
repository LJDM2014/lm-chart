# lm-chart

基于 Vue 3 的图表画廊演示站：分类展示各种有特色的数据可视化图表，供开发者浏览、交互预览并学习各图表库的配置技巧。

## 功能特性

- **22+ 图表示例**，覆盖 ECharts、AntV G2、Chart.js、ApexCharts、D3 共 5 个图表库，6 大分类（基础图表 / 统计分析 / 关系网络 / 地理空间 / 特色创意 / 动态交互）
- **插件化图表注册系统**：路由、画廊列表、搜索索引全部由 `import.meta.glob` 自动聚合，新增图表零登记
- **亮 / 暗双主题**：CSS 变量驱动，所有图表响应主题变化重绘
- **全局搜索**：按标题 / 标签 / 分类 / 库 / 描述模糊匹配，支持键盘导航（↑ ↓ Enter Esc）
- **收藏夹**：localStorage 持久化，画廊「只看收藏」筛选、首页收藏速览
- **参数实时调节**：详情页参数面板（配色方案 / 滑块 / 开关 / 下拉）经各库增量 API 即时生效，不销毁重建图表
- **按需加载**：所有图表库动态 import 分包，进入详情页才加载对应库

## 技术栈

Vite 5 · TypeScript（strict，禁用 any）· Vue 3.4（`<script setup>`）· Pinia · Vue Router 4 · ECharts 5 · AntV G2 · Chart.js 4 · ApexCharts · D3 7 · shiki（源码高亮）· 手写 CSS（无组件库）

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器（默认 http://localhost:5173）
npm run build      # 类型检查 + 生产构建
npm run preview    # 本地预览生产构建（默认 http://localhost:4173）
npm run lint       # ESLint 检查
```

## 新增图表指南

### 目录结构

每个图表是一个**自包含目录**，放进对应图表库的文件夹即可被 Registry 自动收录，**无需任何手工登记**：

```
src/charts/{库名}/{图表名}/
├── meta.ts     # ChartMeta 元信息（必填，默认导出）
├── Chart.vue   # 渲染组件（必填，默认导出）
├── config.ts   # 图表配置 + 参数控件声明（必填，源码展示的数据来源）
└── data.ts     # 演示数据（可选）
```

`{库名}` 取值：`echarts` / `g2` / `chartjs` / `apexcharts` / `d3`；`{图表名}` 与 `meta.id` 保持一致（kebab-case）。

### meta.ts 字段说明

```ts
import type { ChartMeta } from '@/types/chart'

const meta: ChartMeta = {
  id: 'my-chart',              // 唯一 id，必须与目录名一致
  title: '我的图表',            // 展示标题
  category: 'basic',           // 分类：basic | stats | relation | geo | creative | interaction
  lib: 'echarts',              // 所属库：echarts | g2 | chartjs | apexcharts | d3（与上级目录一致）
  tags: ['示例'],               // 标签（参与搜索）
  description: '一句话描述这张图表的亮点与适用场景。',
  difficulty: 'beginner',      // 难度：beginner | intermediate | advanced
  featured: true,              // 可选：是否在首页「精选图表」展示
}

export default meta
```

### Chart.vue 写法

不要直接触碰图表库 API，而是复用 `src/components/` 下的通用容器（内部走统一适配器，自动处理挂载 / resize / 销毁 / 主题重绘 / 参数注入）：

| 所属库 | 容器组件 | 传入的构建函数 |
| --- | --- | --- |
| ECharts | `EchartsChart` | `buildOption(theme, params?)` |
| AntV G2 | `G2Chart` | `buildSpec(theme, params?)` |
| Chart.js | `ChartjsChart` | `buildConfig(theme, params?)` |
| ApexCharts | `ApexChart` | `buildConfig(theme, params?)` |
| D3 | 手写渲染 | 参考 `src/charts/d3/d3-force-graph/` |

```vue
<script setup lang="ts">
import EchartsChart from '@/components/EchartsChart.vue'
import { buildOption } from './config'
</script>

<template>
  <EchartsChart :build-option="buildOption" />
</template>
```

### config.ts：配置与参数控件

`config.ts` 导出两部分内容：**图表配置构建函数**（`theme` 由适配器注入当前主题色，保证暗色重绘）与**参数控件声明**（详情页右侧参数面板据此渲染）。「配色方案」「动画开关」是全局通用控件，无需自行声明。

```ts
import type { EChartsOption } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { months, monthlySales } from './data'

/** 参数面板控件（详情页「参数调节」面板渲染） */
export const controls: ControlDef[] = [
  {
    key: 'barWidth',            // 传给构建函数的参数键名
    label: '柱宽',
    type: 'slider',             // slider | toggle | select
    min: 8, max: 40, step: 1,
    default: 20,
    unit: 'px',                 // 可选，数值单位
  },
  {
    key: 'showLabel',
    label: '显示数值标签',
    type: 'toggle',
    default: false,
  },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)          // 「配色方案」下拉 → 色板
  const barWidth = typeof params?.barWidth === 'number' ? params.barWidth : 20
  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,              // 全局「动画」开关
    xAxis: { type: 'category', data: months, axisLabel: { color: theme.textSecondary } },
    yAxis: { type: 'value', axisLabel: { color: theme.textSecondary }, splitLine: { lineStyle: { color: theme.splitLine } } },
    series: [{
      type: 'bar',
      data: monthlySales,
      barWidth,
      itemStyle: { borderRadius: [6, 6, 0, 0], color: palette[0] },
    }],
  }
}
```

控件读取参数时务必做类型守卫（`typeof params?.key === 'number' | 'string' | 'boolean'`），因为初始渲染可能没有参数。

### 主题色

构建函数第二参数之外，`theme: ChartTheme` 提供当前主题下的全部颜色（`text`、`textSecondary`、`axisLine`、`splitLine`、`isDark` 等），来自 `@/adapters/chartTheme`；需要色板时用 `resolvePalette(params, theme)`，切勿写死亮色值。

### 新增后验证

```bash
npm run dev
```

打开画廊页，新图表卡片应自动出现；按「所属库」筛选可见；详情页可预览、查看源码（shiki 高亮）并调节参数。无需修改任何注册代码。

## 部署

项目内置 GitHub Actions 工作流（`.github/workflows/deploy.yml`）：push 到 `main` 分支即自动执行 `typecheck → build → 发布到 GitHub Pages`。

启用步骤：

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
2. push 到 main，等待 workflow 完成
3. 访问 `https://<用户名>.github.io/lm-chart/`

Vite 已配置 `base: './'`（相对路径），任意子路径部署（GitHub Pages 项目页、对象存储子目录）均无需改动；若部署到域名根路径，可将 base 改回 `/`。

## 项目结构

```
src/
├── charts/              # 图表模块（插件化，自动注册）
│   ├── echarts/ g2/ chartjs/ apexcharts/ d3/
│   └── index.ts         # Registry：import.meta.glob 聚合 meta / 组件 / 源码 / 控件声明
├── adapters/            # 统一图表适配器（mount / resize / destroy / update + 主题）
├── components/          # 通用容器（各库渲染容器、ChartCard、GlobalSearch 等）
├── views/               # 页面：HomePage / GalleryPage / ChartDetailPage / NotFoundPage
├── layouts/             # MainLayout（顶栏 + 路由出口）
├── stores/              # Pinia：theme / favorites
├── styles/              # tokens.css 设计变量（含暗色覆盖段）
└── types/               # 公共类型（chart / params）
```
