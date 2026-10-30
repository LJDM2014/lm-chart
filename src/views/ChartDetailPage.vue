<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import type { Highlighter } from 'shiki'
import { getChart, getConfigModule } from '@/charts'
import { CATEGORY_LABELS, DIFFICULTY_LABELS, LIB_LABELS } from '@/types/chart'
import { PALETTE_CONTROL, CHART_PARAMS_KEY } from '@/types/params'
import type { ControlDef, ParamValue, ParamValues } from '@/types/params'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const favorites = useFavoritesStore()

const entry = computed(() => getChart(String(route.params.lib), String(route.params.id)))

/** 图表预览：defineAsyncComponent 惰性加载对应图表库 */
const AsyncChart = computed(() =>
  entry.value ? defineAsyncComponent(entry.value.component) : null,
)

/* ---------------- 收藏 ---------------- */

const favoriteKey = computed(() =>
  entry.value ? `${entry.value.meta.lib}/${entry.value.meta.id}` : '',
)
const isFavorite = computed(() =>
  favoriteKey.value ? favorites.has(favoriteKey.value) : false,
)

/* ---------------- 参数调节面板 ---------------- */

const panelControls = ref<ControlDef[]>([])
const panelParams = ref<ParamValues>({})
const panelOpen = ref(true)

/** 注入给图表容器组件：每次变化生成新对象，容器 watch 即可感知 */
provide(
  CHART_PARAMS_KEY,
  computed(() => ({ ...panelParams.value })),
)

watch(
  entry,
  async (current) => {
    panelControls.value = []
    panelParams.value = {}
    panelOpen.value = true
    if (!current) return

    const token = route.fullPath
    try {
      const mod = await getConfigModule(current.meta.lib, current.meta.id)
      if (route.fullPath !== token) return
      const controls: ControlDef[] = [PALETTE_CONTROL, ...(mod?.controls ?? [])]
      panelControls.value = controls
      panelParams.value = Object.fromEntries(controls.map((c) => [c.key, c.default]))
    } catch {
      // config 模块加载失败时隐藏面板，不影响预览
      panelControls.value = []
    }
  },
  { immediate: true },
)

function setParam(control: ControlDef, value: ParamValue) {
  panelParams.value = { ...panelParams.value, [control.key]: value }
}

function resetParams() {
  panelParams.value = Object.fromEntries(panelControls.value.map((c) => [c.key, c.default]))
}

/* ---------------- 源码展示 ---------------- */

const sourceCode = ref('')
const highlighted = ref('')
const copyState = ref<'idle' | 'done' | 'error'>('idle')

/** 高亮器懒加载 + 缓存：JavaScript 正则引擎，避免 WASM 加载失败导致高亮不可用 */
let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(async (shiki) =>
      shiki.createHighlighter({
        themes: ['github-light', 'one-dark-pro'],
        langs: ['typescript'],
        engine: shiki.createJavaScriptRegexEngine({ forgiving: true }),
      }),
    )
  }
  return highlighterPromise
}

watch(
  entry,
  async (current) => {
    highlighted.value = ''
    sourceCode.value = ''
    copyState.value = 'idle'
    if (!current) return

    const token = route.fullPath
    const code = await current.configSource()
    // 防止路由快速切换时的竞态覆盖
    if (route.fullPath !== token) return
    // 源码先就绪，保证复制按钮始终可用
    sourceCode.value = code

    try {
      const highlighter = await getHighlighter()
      if (route.fullPath !== token) return
      highlighted.value = highlighter.codeToHtml(code, {
        lang: 'typescript',
        themes: { light: 'github-light', dark: 'one-dark-pro' },
      })
    } catch {
      // 高亮失败时降级为纯文本展示
      highlighted.value = ''
    }
  },
  { immediate: true },
)

async function copySource() {
  try {
    await navigator.clipboard.writeText(sourceCode.value)
    copyState.value = 'done'
  } catch {
    // clipboard API 不可用时的兜底
    const textarea = document.createElement('textarea')
    textarea.value = sourceCode.value
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    copyState.value = ok ? 'done' : 'error'
  }
  setTimeout(() => {
    copyState.value = 'idle'
  }, 2200)
}
</script>

<template>
  <section v-if="entry && AsyncChart" class="detail">
    <header class="detail-header">
      <div class="title-row">
        <h1>{{ entry.meta.title }}</h1>
        <button
          type="button"
          class="fav-btn"
          :class="{ active: isFavorite }"
          :title="isFavorite ? '取消收藏' : '加入收藏'"
          :aria-label="isFavorite ? '取消收藏' : '加入收藏'"
          @click="favorites.toggle(favoriteKey)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
            <path d="M12 2.5 15 8.6l6.7 1-4.85 4.73 1.15 6.67L12 17.8l-6 3.2 1.15-6.67L2.3 9.6l6.7-1z" />
          </svg>
        </button>
        <span class="badge badge--lib">{{ LIB_LABELS[entry.meta.lib] }}</span>
        <span class="badge badge--category">{{ CATEGORY_LABELS[entry.meta.category] }}</span>
        <span class="badge badge--difficulty">{{ DIFFICULTY_LABELS[entry.meta.difficulty] }}</span>
      </div>
      <p class="description">{{ entry.meta.description }}</p>
      <div class="tags">
        <span v-for="tag in entry.meta.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </header>

    <div class="detail-body">
      <div class="detail-main">
        <div class="preview-panel">
          <AsyncChart />
        </div>

        <div class="source-panel">
          <div class="source-header">
            <span class="source-file">config.ts</span>
            <button
              type="button"
              class="copy-btn"
              :class="{ done: copyState === 'done', error: copyState === 'error' }"
              @click="copySource"
            >
              {{ copyState === 'done' ? '已复制' : copyState === 'error' ? '复制失败' : '复制' }}
            </button>
          </div>
          <div v-if="highlighted" class="code-block" v-html="highlighted"></div>
          <pre v-else-if="sourceCode" class="code-plain">{{ sourceCode }}</pre>
        </div>
      </div>

      <aside v-show="panelOpen && panelControls.length > 0" class="params-panel">
        <div class="params-head">
          <span class="params-title">参数调节</span>
          <button
            type="button"
            class="params-reset"
            title="恢复默认参数"
            @click="resetParams"
          >
            重置
          </button>
        </div>

        <div class="params-list">
          <div v-for="control in panelControls" :key="control.key" class="param-row">
            <div class="param-label">{{ control.label }}</div>

            <label v-if="control.type === 'toggle'" class="switch">
              <input
                type="checkbox"
                :checked="panelParams[control.key] === true"
                @change="setParam(control, ($event.target as HTMLInputElement).checked)"
              />
              <span class="knob"></span>
            </label>

            <div v-else-if="control.type === 'slider'" class="slider-wrap">
              <input
                type="range"
                class="slider"
                :min="control.min"
                :max="control.max"
                :step="control.step ?? 1"
                :value="Number(panelParams[control.key] ?? control.default)"
                @input="setParam(control, Number(($event.target as HTMLInputElement).value))"
              />
              <span class="slider-value">
                {{ Number(panelParams[control.key] ?? control.default) }}{{ control.unit ?? '' }}
              </span>
            </div>

            <select
              v-else-if="control.type === 'select'"
              class="param-select"
              :value="String(panelParams[control.key] ?? control.default)"
              @change="setParam(control, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="opt in control.options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <p class="params-hint">参数经各库增量 API 实时生效，不会销毁重建图表</p>
      </aside>
    </div>

    <!-- 移动端：参数面板折叠为底部抽屉 -->
    <button
      v-show="panelControls.length > 0"
      type="button"
      class="params-fab"
      @click="panelOpen = true"
    >
      参数
    </button>
    <div
      v-show="panelOpen && panelControls.length > 0"
      class="params-backdrop"
      @click="panelOpen = false"
    ></div>
  </section>

  <section v-else-if="!entry" class="not-found">
    <p>未找到该图表，请返回画廊重新选择。</p>
  </section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.detail-header .title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.detail-header h1 {
  margin: 0;
  font-size: 24px;
  margin-right: var(--space-2);
}

.fav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-tertiary);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.fav-btn:hover,
.fav-btn.active {
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.fav-btn.active svg {
  animation: fav-pop 0.25s ease;
}

@keyframes fav-pop {
  50% {
    transform: scale(1.25);
  }
}

.badge {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

.badge--lib {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.badge--category {
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}

.badge--difficulty {
  color: var(--color-warning);
  background: transparent;
  border: 1px solid currentColor;
}

.description {
  margin: var(--space-2) 0 0;
  max-width: 720px;
  color: var(--color-text-secondary);
  font-size: 13.5px;
}

.tags {
  display: flex;
  gap: 6px;
  margin-top: var(--space-2);
  flex-wrap: wrap;
}

.tag {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}

/* ------- 布局：主区 + 右侧参数面板 ------- */

.detail-body {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.detail-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.preview-panel {
  height: 460px;
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: background-color 0.25s ease;
}

/* ------- 参数面板 ------- */

.params-panel {
  flex-shrink: 0;
  width: 264px;
  position: sticky;
  top: calc(var(--topbar-h) + 16px);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.params-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.params-title {
  font-size: 14px;
  font-weight: 600;
}

.params-reset {
  padding: 3px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 11.5px;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.params-reset:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.param-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: 30px;
}

.param-label {
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

/* 开关 */
.switch {
  position: relative;
  width: 38px;
  height: 21px;
  flex-shrink: 0;
  cursor: pointer;
}

.switch input {
  display: none;
}

.switch .knob {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--color-border);
  transition: background-color 0.2s ease;
}

.switch .knob::after {
  content: '';
  position: absolute;
  top: 2.5px;
  left: 2.5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
}

.switch input:checked + .knob {
  background: var(--color-primary);
}

.switch input:checked + .knob::after {
  transform: translateX(17px);
}

/* 滑块 */
.slider-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 150px;
}

.slider {
  flex: 1;
  height: 4px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.slider-value {
  flex-shrink: 0;
  min-width: 38px;
  text-align: right;
  font-size: 11.5px;
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
}

/* 下拉 */
.param-select {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
}

.param-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.params-hint {
  margin: var(--space-3) 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-tertiary);
}

/* ------- 源码区 ------- */

.source-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
}

.source-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.source-file {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.copy-btn {
  padding: 4px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.copy-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.copy-btn.done {
  color: var(--color-success);
  border-color: var(--color-success);
}

.copy-btn.error {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.code-block {
  max-height: 560px;
  overflow: auto;
  font-size: 13px;
}

.code-block :deep(pre) {
  margin: 0;
  padding: var(--space-4);
  background: var(--color-bg);
  font-family: var(--font-mono);
  line-height: 1.7;
}

.code-block :deep(code) {
  display: block;
  font-family: var(--font-mono);
}

.code-plain {
  margin: 0;
  padding: var(--space-4);
  max-height: 560px;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--color-text);
}

.not-found {
  padding: var(--space-7) 0;
  text-align: center;
  color: var(--color-text-secondary);
}

/* ------- 移动端：底部抽屉 ------- */

.params-fab {
  display: none;
}

.params-backdrop {
  display: none;
}

@media (max-width: 900px) {
  .detail-body {
    flex-direction: column;
    /* 纵向布局时恢复拉伸：flex-start 会让 .detail-main 收缩为源码块内容宽度，造成横向溢出 */
    align-items: stretch;
  }

  .params-panel {
    position: fixed;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 300;
    width: auto;
    max-height: 62vh;
    overflow: auto;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.18);
    animation: drawer-up 0.25s ease;
  }

  @keyframes drawer-up {
    from {
      transform: translateY(100%);
    }
  }

  .params-fab {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: 18px;
    bottom: 22px;
    z-index: 290;
    width: 56px;
    height: 56px;
    border: none;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }

  .params-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 280;
    background: rgba(0, 0, 0, 0.4);
  }

  .preview-panel {
    height: 360px;
  }
}
</style>
