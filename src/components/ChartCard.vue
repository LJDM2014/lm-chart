<script setup lang="ts">
/**
 * 画廊图表卡片：进入视口后才惰性加载并渲染真实图表预览（IntersectionObserver）
 */
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { ChartEntry } from '@/charts'
import { CATEGORY_LABELS, DIFFICULTY_LABELS, LIB_LABELS } from '@/types/chart'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps<{ entry: ChartEntry }>()

const favorites = useFavoritesStore()
const favoriteKey = `${props.entry.meta.lib}/${props.entry.meta.id}`
const isFavorite = computed(() => favorites.has(favoriteKey))

// RouterLink 的 ref 是组件实例，取 $el 作为观测目标
const rootRef = ref<HTMLElement | ComponentPublicInstance | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

const detailLink = `/chart/${props.entry.meta.lib}/${props.entry.meta.id}`
const AsyncChart = defineAsyncComponent(props.entry.component)

function resolveTarget(): HTMLElement | null {
  const el = rootRef.value
  if (!el) return null
  return el instanceof HTMLElement ? el : ((el as ComponentPublicInstance).$el as HTMLElement)
}

onMounted(() => {
  observer = new IntersectionObserver(
    (items) => {
      if (items.some((item) => item.isIntersecting)) {
        visible.value = true
        observer?.disconnect()
        observer = null
      }
    },
    { rootMargin: '240px 0px' },
  )
  const target = resolveTarget()
  if (target) observer.observe(target)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <RouterLink :to="detailLink" class="chart-card" ref="rootRef">
    <div class="preview">
      <template v-if="visible">
        <AsyncChart />
      </template>
      <div v-else class="preview-skeleton"></div>
      <button
        type="button"
        class="fav-btn"
        :class="{ active: isFavorite }"
        :title="isFavorite ? '取消收藏' : '加入收藏'"
        :aria-label="isFavorite ? '取消收藏' : '加入收藏'"
        @click.stop.prevent="favorites.toggle(favoriteKey)"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
          <path d="M12 2.5 15 8.6l6.7 1-4.85 4.73 1.15 6.67L12 17.8l-6 3.2 1.15-6.67L2.3 9.6l6.7-1z" />
        </svg>
      </button>
    </div>
    <div class="info">
      <div class="title-row">
        <h3 class="title">{{ entry.meta.title }}</h3>
        <span class="lib-badge">{{ LIB_LABELS[entry.meta.lib] }}</span>
      </div>
      <p class="desc">{{ entry.meta.description }}</p>
      <div class="meta-row">
        <span class="category-tag">{{ CATEGORY_LABELS[entry.meta.category] }}</span>
        <span v-for="tag in entry.meta.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
        <span
          class="difficulty"
          :class="`difficulty--${entry.meta.difficulty}`"
        >
          {{ DIFFICULTY_LABELS[entry.meta.difficulty] }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.chart-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.preview {
  height: 210px;
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
  background:
    linear-gradient(135deg, transparent 12px, var(--color-bg) 0) top left / 50% 50% no-repeat,
    var(--color-bg);
}

.preview :deep(.echarts-host) {
  width: 100%;
  height: 100%;
}

.preview-skeleton {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-md);
  background: linear-gradient(
    100deg,
    var(--color-surface-hover) 40%,
    var(--color-border) 50%,
    var(--color-surface-hover) 60%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-tertiary);
  opacity: 0;
  transition:
    opacity 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.chart-card:hover .fav-btn,
.fav-btn.active {
  opacity: 1;
}

.fav-btn:hover {
  color: var(--color-warning);
  border-color: var(--color-warning);
  transform: scale(1.08);
}

.fav-btn.active {
  color: var(--color-warning);
  border-color: var(--color-warning);
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

.info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.lib-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.category-tag,
.tag {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}

.difficulty {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
}

.difficulty--beginner {
  color: var(--color-success);
}

.difficulty--intermediate {
  color: var(--color-warning);
}

.difficulty--advanced {
  color: var(--color-danger);
}
</style>
