<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getAllCharts, getCategoryCounts, getChart, getFeaturedCharts } from '@/charts'
import { CHART_CATEGORIES, CHART_LIBS, CATEGORY_LABELS } from '@/types/chart'
import { useFavoritesStore } from '@/stores/favorites'
import ChartCard from '@/components/ChartCard.vue'

const all = getAllCharts()
const featured = getFeaturedCharts()
const categoryCounts = getCategoryCounts()
const favorites = useFavoritesStore()

/** 收藏区：按收藏键还原为图表条目（保持收藏先后顺序） */
const favoriteEntries = computed(() =>
  favorites.ids
    .map((key) => {
      const [lib, id] = key.split('/')
      return getChart(lib, id)
    })
    .filter((entry) => entry !== undefined),
)
</script>

<template>
  <section class="home">
    <header class="hero">
      <h1>LM Chart 图表画廊</h1>
      <p class="hero-sub">分类展示有特色的数据可视化图表，交互预览并学习各图表库的配置技巧</p>
      <div class="stats">
        <div class="stat">
          <strong>{{ all.length }}</strong>
          <span>图表</span>
        </div>
        <div class="stat">
          <strong>{{ CHART_LIBS.length }}</strong>
          <span>图表库</span>
        </div>
        <div class="stat">
          <strong>{{ CHART_CATEGORIES.length }}</strong>
          <span>分类</span>
        </div>
      </div>
    </header>

    <section v-if="favoriteEntries.length > 0" class="block">
      <div class="block-head">
        <h2>我的收藏</h2>
        <RouterLink to="/gallery?fav=1" class="more-link">全部收藏 →</RouterLink>
      </div>
      <div class="card-grid">
        <ChartCard
          v-for="entry in favoriteEntries.slice(0, 4)"
          :key="entry.meta.lib + entry.meta.id"
          :entry="entry"
        />
      </div>
    </section>

    <section v-if="featured.length > 0" class="block">
      <div class="block-head">
        <h2>精选图表</h2>
        <RouterLink to="/gallery" class="more-link">浏览画廊 →</RouterLink>
      </div>
      <div class="card-grid">
        <ChartCard
          v-for="entry in featured.slice(0, 8)"
          :key="entry.meta.lib + entry.meta.id"
          :entry="entry"
        />
      </div>
    </section>

    <section class="block">
      <div class="block-head">
        <h2>按分类浏览</h2>
      </div>
      <div class="category-grid">
        <RouterLink
          v-for="category in CHART_CATEGORIES"
          :key="category"
          :to="`/gallery?category=${category}`"
          class="category-card"
        >
          <span class="cat-name">{{ CATEGORY_LABELS[category] }}</span>
          <span class="cat-count">{{ categoryCounts[category] }} 个图表</span>
          <span class="cat-arrow">→</span>
        </RouterLink>
      </div>
    </section>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
}

.hero {
  padding: var(--space-6) 0 var(--space-2);
  text-align: center;
}

.hero h1 {
  margin: 0 0 var(--space-2);
  font-size: 32px;
  letter-spacing: 0.5px;
}

.hero-sub {
  margin: 0 auto;
  max-width: 560px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.stats {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  margin-top: var(--space-5);
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: var(--space-2) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
}

.stat strong {
  font-size: 20px;
  color: var(--color-primary);
}

.stat span {
  font-size: 12.5px;
  color: var(--color-text-secondary);
}

.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.block-head h2 {
  margin: 0;
  font-size: 19px;
}

.more-link {
  font-size: 13px;
  color: var(--color-primary);
}

.more-link:hover {
  text-decoration: underline;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-5);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
}

.category-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.category-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cat-name {
  font-size: 14.5px;
  font-weight: 600;
}

.cat-count {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.cat-arrow {
  color: var(--color-primary);
  font-size: 15px;
}

@media (max-width: 640px) {
  .hero h1 {
    font-size: 24px;
  }

  .stats {
    gap: var(--space-3);
  }

  .stat {
    padding: var(--space-2) var(--space-3);
  }
}
</style>
