import { defineStore } from 'pinia'

/** 与持久化键约定保持一致 */
export const FAVORITES_STORAGE_KEY = 'lm-chart-favorites'

function loadInitial(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

/** 收藏系统：键为 `${lib}/${id}`，localStorage 持久化，刷新不丢失 */
export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    ids: loadInitial(),
  }),
  getters: {
    has: (state) => (key: string) => state.ids.includes(key),
    count: (state) => state.ids.length,
  },
  actions: {
    toggle(key: string) {
      const index = this.ids.indexOf(key)
      if (index >= 0) this.ids.splice(index, 1)
      else this.ids.push(key)
      this.persist()
    },
    persist() {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.ids))
      } catch {
        /* 持久化失败不阻塞 UI */
      }
    },
  },
})
