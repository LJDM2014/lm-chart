<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import GlobalSearch from '@/components/GlobalSearch.vue'

const theme = useThemeStore()
const route = useRoute()

const navItems = [
  { name: 'home', label: '首页', to: '/' },
  { name: 'gallery', label: '画廊', to: '/gallery' },
] as const
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <RouterLink to="/" class="logo">
          <span class="logo-mark">LM</span>
          <span class="logo-text">Chart</span>
        </RouterLink>

        <nav class="nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            class="nav-link"
            :class="{ active: route.name === item.name }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="topbar-right">
          <GlobalSearch />

          <button
            class="theme-toggle"
            type="button"
            :title="theme.isDark ? '切换到亮色主题' : '切换到暗色主题'"
            :aria-label="theme.isDark ? '切换到亮色主题' : '切换到暗色主题'"
            @click="theme.toggle()"
          >
            <svg v-if="theme.isDark" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--topbar-h);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease;
}

.topbar-inner {
  max-width: var(--content-max);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.logo-mark {
  color: var(--color-primary);
}

.nav {
  display: flex;
  gap: var(--space-2);
  flex: 1;
}

.nav-link {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-weight: 500;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.nav-link.active {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.theme-toggle:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.page-container {
  flex: 1;
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-6) var(--space-5);
}

@media (max-width: 640px) {
  .global-search {
    display: none;
  }

  .topbar-inner {
    gap: var(--space-4);
    padding: 0 var(--space-4);
  }
}
</style>
