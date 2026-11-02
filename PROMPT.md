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

## 阶段 6：高级图表拓展

```
【任务】为 lm-chart 批量新增高级图表（阶段 6，可按批次 6a/6b/6c 分多次会话执行）

【必须遵守的现有约定（与代码一致，不得偏离）】
1. 每个图表一个目录：src/charts/{lib}/{id}/，含四件套
   meta.ts / Chart.vue / config.ts / data.ts，Registry 自动发现，
   严禁手工登记，严禁改动 src/charts/index.ts 与已有图表
2. meta.ts 导出 ChartMeta：id（=目录名）、title、category、lib、tags、
   description、difficulty、featured（仅特别出色的图表设 true）
3. ECharts/G2/Chart.js/ApexCharts 图表的 config.ts 必须导出：
   - controls?: ControlDef[]（type 仅限 toggle/slider/select，见 src/types/params.ts）
   - buildOption(theme, params?) 返回完整配置
   params 消费风格参照 src/charts/echarts/sankey-diagram/config.ts：
   布尔参数用 `params?.x !== false` 兜底，数值参数用 typeof 判断兜底
4. ECharts 适配器按需注册组件，禁止 import * as echarts 全量引入；
   需要扩展包（如 echarts-gl、custom series）时先确认适配器已注册
5. D3/G6 图表为手写实现模式（参照 d3-force-graph、g6-mind-map），
   config.ts 可只导出 controls；Chart.vue 内自行处理 resize/destroy
6. 所有图表：ResizeObserver 容器自适应、onUnmounted destroy、
   监听主题变化重绘（文字/轴线/分割线颜色随 ChartTheme）
7. TypeScript strict、禁止 any；npm run build 必须通过

【本阶段目标图表清单（按批次执行，每批 3~5 个）】
- 批次 6a（ECharts 高级）：
  · 3D 散点/曲面图（echarts-gl，注意 chunk 分包）
  · custom series 自定义系列（如日历热力图 calendar heatmap）
  · 主题河流图 themeRiver
  · 矩形树图 treemap（带下钻交互）
- 批次 6b（G2 / Chart.js / ApexCharts 补强）：
  · G2：河流图 streamgraph、分面图 facet、复合图
  · Chart.js：气泡图、混合时间轴图
  · ApexCharts：范围柱状图、热力日历
- 批次 6c（D3 / G6 定制，体现手写能力）：
  · D3：弦图 chord diagram、旭日图 sunburst、河流图 streamgraph
  · G6：依赖关系 DAG 布局图、环形关系图

【每个图表的交付要求】
- data.ts 提供自造的合理演示数据（真实业务语义，不得用 lorem 占位）
- config.ts 暴露 3~5 个参数控件（如系列显隐、曲线弯曲度、节点大小、
  排序方式等），全部经 buildOption 或组件内增量更新生效，禁止销毁重建
- difficulty 按真实复杂度标注，新增图表至少一半为 advanced
- 不与现有 30+ 图表语义重复（新增前先查 Registry）

【验收（每批次完成后）】
- 每个新图表在浏览器中实测：交互预览正常、参数调节即时生效、
  暗色主题下文字/网格颜色正确
- 画廊页按分类/按库筛选能看到新图表，搜索标签能命中
- npm run build 通过，新库（如 echarts-gl）为独立 chunk
- 验证"新增文件夹即自动收录"未被破坏
```

---

## 阶段 7：短板补强（地理 / 动态 / 创意）

```
【任务】补齐分类短板：地理空间分类为空、动态交互与特色创意偏薄
（阶段 7，可按批次 7a/7b 分多次会话执行）

【必须遵守的现有约定（与阶段 6 一致，不得偏离）】
1. 四件套目录结构 + Registry 自动发现；严禁手工登记，
   严禁改动 src/charts/index.ts 与已有图表（适配器可扩展注册组件）
2. meta.ts 导出 ChartMeta；config.ts 导出 controls?: ControlDef[] 与
   buildOption(theme, params?)（ECharts/G2/Chart.js/ApexCharts）
3. TypeScript strict、禁止 any；ResizeObserver 自适应、destroy、主题响应重绘
4. 禁止引入新的第三方图表库；ECharts 适配器按需注册组件，不全量引入

【本阶段目标图表清单（按批次执行）】
- 批次 7a（地理空间，ECharts geo，首批覆盖该分类）：
  · 中国地图涟漪散点图（map + effectScatter，城市级指标分布）
  · 城市间飞线图（geo + lines，带尾迹特效，迁徙/航线语义）
  · 省份填色热力地图（map + visualMap 连续色阶）
  技术要点：地图 GeoJSON 放 public/geo/ 下运行时 fetch 加载，禁止打进主包；
  适配器需注册 MapChart / EffectScatterChart / LinesChart / GeoComponent / VisualMap
- 批次 7b（动态交互 + 创意补强）：
  · ECharts 动态排序条形图（bar race，定时轮换数据 + 增量 setOption）
  · Chart.js 实时滑动窗口折线（滚动数据流，数据窗口恒定）
  · ECharts 玫瑰图 nightingale rose（特色创意）
  · D3 手写 packed circles 气泡图（d3-hierarchy pack，体现定制能力）

【每个图表的交付要求（同阶段 6）】
- data.ts 自造合理演示数据（真实业务语义）；config.ts 暴露 3~5 个参数控件
- 增量更新生效（动态类图表只 setOption 数据/样式，不销毁重建）
- 新增图表至少一半为 advanced；不与现有 42 个图表语义重复

【验收（每批次完成后）】
- 浏览器逐图实测：渲染、交互、参数即时生效、暗色主题正确
- 画廊收录 + 按分类「地理空间」筛选可见 7a 图表，搜索标签命中
- npm run build 通过；geo 图表组件为独立 chunk，地图 JSON 不入主包
- 动态类图表连续运行 30s 无内存持续增长、无 console 报错
```

---

## 里程碑对照

| 阶段 | 交付物 | 状态 |
|---|---|---|
| 1 | 可运行的空壳站点（路由 + 主题） | ☑ |
| 2 | 核心链路可用（Registry + ECharts 10+ 图表） | ☑ |
| 3 | 5 库并存（每库 3~5 图表） | ☑ |
| 4 | 完整功能（搜索/收藏/参数调节/响应式） | ☑ |
| 5 | 正式上线（CI 部署 + 文档） | ☑ |
| 6 | 高级图表拓展（6a/6b/6c 三批，共 12+ 个高级图表） | ☑ |
| 7 | 短板补强（地理空间 3 图 + 动态/创意 4 图，共 49 个图表） | ☑ |
