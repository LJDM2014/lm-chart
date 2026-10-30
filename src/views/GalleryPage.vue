<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAllCharts, getCategoryCounts } from '@/charts'
import { CHART_CATEGORIES, CHART_LIBS, CATEGORY_LABELS, LIB_LABELS } from '@/types/chart'
import type { ChartCategory, ChartLib } from '@/types/chart'
import { useFavoritesStore } from '@/stores/favorites'
import ChartCard from '@/components/ChartCard.vue'

const route = useRoute()
const all = getAllCharts()
const categoryCounts = getCategoryCounts()
const favorites = useFavoritesStore()

function isCategory(value: unknown): value is ChartCategory {
  return typeof value === 'string' && (CHART_CATEGORIES as readonly string[]).includes(value)
}

const activeCategory = ref<'all' | ChartCategory>(
  isCategory(route.query.category) ? route.query.category : 'all',
)
const activeLib = ref<'all' | ChartLib>('all')
const onlyFavorites = ref<boolean>(route.query.fav === '1')

// 首页分类入口 / 收藏区通过 query 带入初始筛选
watch(
  () => route.query,
  (query) => {
    if (isCategory(query.category)) activeCategory.value = query.category
    onlyFavorites.value = query.fav === '1'
  },
)

const filtered = computed(() =>
  all.filter((entry) => {
    if (activeCategory.value !== 'all' && entry.meta.category !== activeCategory.value) return false
    if (activeLib.value !== 'all' && entry.meta.lib !== activeLib.value) return false
    if (onlyFavorites.value && !favorites.has(`${entry.meta.lib}/${entry.meta.id}`)) return false
    return true
  }),
)

function selectCategory(value: 'all' | ChartCategory) {
  activeCategory.value = value
}

function selectLib(value: 'all' | ChartLib) {
  activeLib.value = value
}

function resetFilters() {
  selectCategory('all')
  selectLib('all')
  onlyFavorites.value = false
}
</script>

<template>
  <section class="gallery">
    <header class="gallery-header">
      <div class="gallery-title">
        <div>
          <h1>图表画廊</h1>
          <p class="subtitle">共 {{ all.length }} 个图表 · 按「分类」与「所属图表库」双维筛选</p>
        </div>
        <button
          type="button"
          class="chip fav-toggle"
          :class="{ active: onlyFavorites }"
          @click="onlyFavorites = !onlyFavorites"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" :fill="onlyFavorites ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
            <path d="M12 2.5 15 8.6l6.7 1-4.85 4.73 1.15 6.67L12 17.8l-6 3.2 1.15-6.67L2.3 9.6l6.7-1z" />
          </svg>
          只看收藏
        </button>
      </div>
    </header>

    <div class="filter-block">
      <div class="filter-row">
        <span class="filter-label">分类</span>
        <div class="chips">
          <button
            type="button"
            class="chip"
            :class="{ active: activeCategory === 'all' }"
            @click="selectCategory('all')"
          >
            全部 <span class="chip-count">{{ all.length }}</span>
          </button>
          <button
            v-for="category in CHART_CATEGORIES"
            :key="category"
            type="button"
            class="chip"
            :class="{ active: activeCategory === category }"
            @click="selectCategory(category)"
          >
            {{ CATEGORY_LABELS[category] }}
            <span class="chip-count">{{ categoryCounts[category] }}</span>
          </button>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">图表库</span>
        <div class="chips">
          <button
            type="button"
            class="chip"
            :class="{ active: activeLib === 'all' }"
            @click="selectLib('all')"
          >
            全部
          </button>
          <button
            v-for="lib in CHART_LIBS"
            :key="lib"
            type="button"
            class="chip"
            :class="{ active: activeLib === lib }"
            @click="selectLib(lib)"
          >
            {{ LIB_LABELS[lib] }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="filtered.length > 0" class="card-grid">
      <ChartCard v-for="entry in filtered" :key="entry.meta.lib + entry.meta.id" :entry="entry" />
    </div>

    <div v-else class="empty">
      <p>{{ onlyFavorites ? '还没有收藏的图表，去画廊点亮星标吧' : '没有符合筛选条件的图表' }}</p>
      <button
        type="button"
        class="empty-reset"
        @click="resetFilters"
      >
        重置筛选
      </button>
    </div>
  </section>
</template>

<style scoped>
.gallery-header h1 {
  margin: 0 0 4px;
  font-size: 24px;
}

.gallery-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.fav-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.subtitle {
  margin: 0 0 var(--space-5);
  color: var(--color-text-secondary);
  font-size: 13px;
}

.filter-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.filter-label {
  flex-shrink: 0;
  width: 48px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip {
  padding: 5px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12.5px;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.chip:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
}

.chip.active {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  font-weight: 600;
}

.chip-count {
  margin-left: 2px;
  font-size: 11px;
  opacity: 0.75;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-5);
}

.empty {
  padding: var(--space-7) 0;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-reset {
  margin-top: var(--space-3);
  padding: 6px 16px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-primary);
  font-size: 13px;
}

.empty-reset:hover {
  background: var(--color-primary-soft);
}

@media (max-width: 640px) {
  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
