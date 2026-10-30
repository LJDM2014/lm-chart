# lm-chart 实现提示词（Prompt 手册）

> **用法**：按阶段推进开发。每次新会话时，将「全局上下文」+ 当前「阶段提示词」一起发送给 AI；当前阶段验收通过后，再进入下一阶段。所有提示词均为自包含，无需历史对话。

---

## 全局上下文（每次对话都附带）

```
你是一位资深前端工程师，正在开发 lm-chart —— 一个基于 Vue 3 的图表画廊演示站，用于分类展示各种有特色的数据可视化图表，供开发者浏览、交互预览并学习图表配置。

【技术栈（必须严格遵守）】
- 构建：Vite 5 + TypeScript（strict 模式，禁止 any）
- 框架：Vue 3.4+，全部使用 <script setup> + Composition API
- 状态：Pinia（主题、收藏、筛选状态）
- 路由：Vue Router 4
- 图表库：ECharts 5、AntV G2、Chart.js 4、ApexCharts、D3 7
  —— 所有图表库一律动态 import 按需加载，禁止在任何入口文件同步引入
- 辅助：shiki（源码高亮）、echarts-liquidfill、echarts-wordcloud
- 代码规范：ESLint + Prettier；不引入组件库大礼包，UI 用手写 CSS 实现简洁现代风格

【核心架构（必须遵守）】
1. 插件化图表注册系统：每个图表是一个自包含模块，目录结构固定为
   src/charts/{库名}/{图表名}/
   ├── meta.ts     # ChartMeta：id、标题、分类、标签、描述、难度、所属库、featured
   ├── Chart.vue   # 渲染组件，容器尺寸自适应
   ├── config.ts   # 完整图表配置对象（详情页源码展示的数据来源）
   └── data.ts     # 演示数据
2. Registry 位于 src/charts/index.ts：用 import.meta.glob 自动聚合所有 meta.ts（eager），
   图表组件用 import.meta.glob 惰性加载；路由、画廊列表、搜索索引全部由 Registry 自动生成。
   新增图表 = 新增一个文件夹，严禁出现需要手工登记的模板代码。
3. 图表库适配器：src/adapters/ 下实现统一生命周期接口 mount(el, config) / resize() / destroy()，
   图表组件只面向适配器编程，不直接触碰各库 API 的差异细节。
4. 性能铁律：图表组件一律 defineAsyncComponent + 动态 import()；Vite 按 charts/{lib}/ 自动分包，
   进入详情页才加载对应图表库。
5. 主题：亮/暗双主题（CSS 变量 + html[data-theme]），Pinia 管理 + localStorage 持久化，
   所有图表必须响应主题变化重绘。

【图表分类体系（6 类，定义为常量枚举）】
基础图表 / 统计分析 / 关系网络 / 地理空间 / 特色创意 / 动态交互

【页面结构】
- /            首页：精选特色图表（featured）、分类快捷入口、搜索框
- /gallery     画廊：卡片网格预览，支持按「分类」和「所属图表库」双维筛选
- /chart/:lib/:id 详情：大区域交互预览 + 配置源码高亮（可复制）+ 参数实时调节面板

【通用验收标准】
- npm run dev 正常运行，npm run build 无 TS 报错
- 每个功能完成后在浏览器中实际验证渲染效果，不要只写代码不验证
- 不做计划外的功能扩展
```

---

## 阶段 1：项目骨架

```
【任务】搭建 lm-chart 项目骨架（阶段 1/5）

在当前目录初始化项目：
1. 使用 Vite 创建 Vue3 + TypeScript 项目（vue-ts 模板），配置 @ 别名指向 src
2. 安装并配置 vue-router、pinia、eslint + prettier（保存自动修复）
3. 目录规划：
   src/
   ├── layouts/MainLayout.vue   # 顶栏（Logo、导航、搜索入口占位、主题切换按钮）+ <router-view>
   ├── views/                   # HomePage / GalleryPage / ChartDetailPage 占位组件
   ├── stores/theme.ts          # Pinia 主题 store，localStorage 持久化
   ├── styles/tokens.css        # 设计变量（颜色、圆角、间距），含暗色覆盖段
   ├── adapters/                # 空目录，阶段 3 使用
   ├── types/                   # 公共类型
   └── charts/                  # 空目录，阶段 2 使用
4. 路由：/、/gallery、/chart/:lib/:id，均套 MainLayout，切换时滚动置顶
5. 主题系统：html[data-theme="dark|light"] 切换 CSS 变量，Pinia 同步状态，刷新后保持

【验收】
- npm run dev 可打开，三个路由可正常切换，顶栏导航高亮当前页
- 主题切换即时生效，刷新后主题保持
- npm run build 通过，无 TS 错误
```

---

## 阶段 2：注册系统 + ECharts 首批图表

```
【任务】实现图表注册系统并接入 ECharts（阶段 2/5）

1. 类型与 Registry：
   - src/types/chart.ts：定义 ChartMeta / ChartCategory / ChartLib 等类型
   - src/charts/index.ts：import.meta.glob('./**/meta.ts', { eager: true }) 聚合元信息，
     组件用 import.meta.glob('./**/Chart.vue') 惰性加载；
     导出 getAllCharts() / getChart(lib, id) / getChartsByCategory() / searchCharts(keyword)
2. 页面联通：
   - 画廊页：渲染 Registry 卡片网格（含缩略预览、标题、分类标签、库名徽标、难度），
     卡片进入视口才加载渲染（IntersectionObserver）
   - 详情页：defineAsyncComponent 加载对应 Chart.vue；下方源码区用 shiki 高亮展示
     config.ts 的完整配置并提供「复制」按钮
3. ECharts 适配器：src/adapters/echarts.ts 实现 mount/resize/destroy，
   按需注册 ECharts 组件（BarChart/LineChart/ PieChart 等按图表引入，不全量 import * as echarts）
4. 安装 echarts-liquidfill、echarts-wordcloud 扩展，创建首批图表（每个一个文件夹，含 meta/config/data）：
   - 基础图表：渐变柱状图、平滑面积图、环形饼图、散点图
   - 特色创意：水球图、词云、象形柱状图
   - 关系网络：桑基图、力导向关系图
   - 统计分析：热力图
   数据使用自造的合理演示数据；完整 option 必须写在 config.ts 中供源码展示
5. ECharts 暗色适配：监听主题变化，统一更新文字/轴线/分割线颜色后 setOption，保持各图表一致

【验收】
- 实际新增一个测试图表文件夹，不改任何代码，画廊/详情/搜索自动生效（验证后删除）
- 打开详情页时 Network 面板确认仅加载 ECharts 相关 chunk
- 10+ 图表全部可交互渲染，暗色主题下显示正常
```

---

## 阶段 3：多图表库接入

```
【任务】接入其余图表库（阶段 3/5）

1. 适配器抽象：src/adapters/types.ts 定义统一接口 mount(el, config)/resize()/destroy()，
   将 ECharts 适配器重构为该接口的第一个实现
2. 接入以下库，每库先实现适配器，再各创建 3~5 个代表性图表：
   - AntV G2：分组柱状图、多系列折线图、饼图、漏斗图
   - Chart.js：堆叠柱状图、雷达图、折线面积图
   - ApexCharts：蜡烛图（K线）、动态刷新折线图、柱线混合图
   - D3.js：手写实现力导向图、平行坐标图（不借助封装库，体现 D3 定制能力）
3. 所有 Chart.vue 遵守统一模式：ResizeObserver 容器自适应 + onUnmounted 时 destroy 防内存泄漏
4. 画廊页「按库筛选」支持全部 5 个库正常过滤；所有库的图表暗色主题下文字/网格颜色正确

【验收】
- npm run build 后 dist 中各图表库为独立 chunk
- 反复进出不同详情页 20 次，页面无卡顿、无内存持续增长
- 每库至少 3 个图表渲染与交互正常
```

---

## 阶段 4：体验增强

```
【任务】完善搜索、收藏与参数调节（阶段 4/5）

1. 全局搜索：顶栏搜索框，基于 Registry 索引按标题/标签/分类/库模糊匹配；
   下拉结果按「分类」分组，支持键盘上下选择 + 回车跳转，Esc 关闭
2. 收藏系统：Pinia + localStorage 持久化；详情页与卡片均可收藏/取消；
   画廊页提供「只看收藏」开关；收藏区在首页展示
3. 参数调节面板：详情页右侧可折叠面板，为当前图表暴露 3~5 个可调参数
   （如系列显隐、配色方案、动画开关、数据排序等），
   通过滑块/开关/下拉交互，实时增量 setOption 更新（禁止整图销毁重建）
4. 性能与响应式：
   - 路由级懒加载、预览渲染防抖 resize
   - 移动端：卡片单列、详情页参数面板折叠为底部抽屉
5. 首页完善：featured 精选区、6 分类入口卡片（显示各类图表数量）、顶部统计条（图表总数/支持库数）

【验收】
- 搜索 → 跳转 → 收藏 → 筛选收藏 全链路可用，刷新后收藏不丢失
- 参数调节即时生效、无明显卡顿
- 移动端（375px 宽）布局可用无横向滚动
```

---

## 阶段 5：部署上线

```
【任务】构建优化、部署与文档（阶段 5/5）

1. 构建优化：rollup manualChunks 明确各图表库分包；移除生产环境 console/debug；
   首屏只加载首页所需代码
2. 部署配置（二选一，推荐前者）：
   - GitHub Actions：push main 自动 build 并发布到 GitHub Pages，配置正确的 vite base 路径
   - 或提供 vercel.json 配置
3. 文档：更新 README.md —— 项目简介、技术栈、本地开发步骤、
   「新增图表指南」（目录结构 + meta 字段说明 + 完整示例）、部署说明
4. 收尾走查：暗色主题全站检查、空状态占位（搜索无结果/无收藏）、404 路由兜底页面

【验收】
- 部署流水线跑通，线上可访问（或 npm run preview + base 路径本地验证通过）
- 严格按 README「新增图表指南」实际新增一个图表可成功收录
```

---

## 里程碑对照

| 阶段 | 交付物 | 状态 |
|---|---|---|
| 1 | 可运行的空壳站点（路由 + 主题） | ☐ |
| 2 | 核心链路可用（Registry + ECharts 10+ 图表） | ☐ |
| 3 | 5 库并存（每库 3~5 图表） | ☐ |
| 4 | 完整功能（搜索/收藏/参数调节/响应式） | ☐ |
| 5 | 正式上线（CI 部署 + 文档） | ☐ |
