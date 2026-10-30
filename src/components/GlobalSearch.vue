<script setup lang="ts">
/**
 * 全局搜索（顶栏）：基于 Registry 索引模糊匹配标题 / 标签 / 分类 / 库 / 描述。
 * 下拉结果按分类分组，支持 ↑↓ 选择、回车跳转、Esc 关闭、点击外部关闭。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchCharts, type ChartEntry } from '@/charts'
import { CHART_CATEGORIES, CATEGORY_LABELS, LIB_LABELS } from '@/types/chart'

const router = useRouter()
const route = useRoute()

const rootRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const keyword = ref('')
const open = ref(false)
const activeIndex = ref(0)

/** 匹配结果上限，避免下拉过长 */
const MAX_RESULTS = 12

const results = computed<ChartEntry[]>(() => {
  const kw = keyword.value.trim()
  if (!kw) return []
  return searchCharts(kw).slice(0, MAX_RESULTS)
})

interface SearchGroup {
  category: string
  label: string
  items: Array<{ entry: ChartEntry; flatIndex: number }>
}

/** 结果按分类分组；flatIndex 为键盘导航的扁平序号 */
const groups = computed<SearchGroup[]>(() => {
  let flat = 0
  return CHART_CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: results.value
      .filter((entry) => entry.meta.category === category)
      .map((entry) => ({ entry, flatIndex: flat++ })),
  })).filter((group) => group.items.length > 0)
})

/** 分组视图的扁平结果列表，与 flatIndex 一一对应（Enter 跳转必须使用同一序号体系） */
const flatEntries = computed<ChartEntry[]>(() =>
  groups.value.flatMap((group) => group.items.map((item) => item.entry)),
)

watch(results, () => {
  activeIndex.value = 0
})

// 键盘高亮项滚动到可视区域
watch(activeIndex, async () => {
  await nextTick()
  rootRef.value
    ?.querySelector('.result-item.active')
    ?.scrollIntoView({ block: 'nearest' })
})

function go(entry: ChartEntry) {
  open.value = false
  keyword.value = ''
  inputRef.value?.blur()
  void router.push(`/chart/${entry.meta.lib}/${entry.meta.id}`)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    inputRef.value?.blur()
    return
  }
  const total = results.value.length
  if (!open.value || total === 0) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % total
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + total) % total
  } else if (event.key === 'Enter') {
    const target = flatEntries.value[activeIndex.value]
    if (target) go(target)
  }
}

function onDocumentClick(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

// 路由切换后自动收起
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="rootRef" class="global-search">
    <div class="search-box">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref="inputRef"
        v-model="keyword"
        type="text"
        placeholder="搜索图表、标签、库…"
        @focus="open = true"
        @keydown="onKeydown"
      />
    </div>

    <div v-if="open && keyword.trim()" class="dropdown">
      <template v-if="groups.length > 0">
        <div v-for="group in groups" :key="group.category" class="group">
          <div class="group-label">{{ group.label }}</div>
          <button
            v-for="item in group.items"
            :key="item.entry.meta.lib + item.entry.meta.id"
            type="button"
            class="result-item"
            :class="{ active: item.flatIndex === activeIndex }"
            @mouseenter="activeIndex = item.flatIndex"
            @click="go(item.entry)"
          >
            <span class="r-title">{{ item.entry.meta.title }}</span>
            <span class="r-lib">{{ LIB_LABELS[item.entry.meta.lib] }}</span>
          </button>
        </div>
      </template>
      <div v-else class="search-empty">未找到与「{{ keyword.trim() }}」相关的图表</div>
    </div>
  </div>
</template>

<style scoped>
.global-search {
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  min-width: 220px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-tertiary);
  font-size: 13px;
  background: var(--color-bg);
  transition: border-color 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--color-primary);
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
}

.search-box input::placeholder {
  color: var(--color-text-tertiary);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  max-height: 380px;
  overflow: auto;
  padding: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 200;
}

.group-label {
  padding: 8px 10px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.result-item.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.r-lib {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.search-empty {
  padding: var(--space-4) var(--space-2);
  text-align: center;
  font-size: 12.5px;
  color: var(--color-text-secondary);
}
</style>
