import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

/** 与 index.html 内联脚本保持一致 */
export const THEME_STORAGE_KEY = 'lm-chart-theme'

function getInitialTheme(): ThemeMode {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    /* localStorage 不可用时忽略 */
  }
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: getInitialTheme(),
  }),
  getters: {
    isDark: (state) => state.mode === 'dark',
  },
  actions: {
    /** 初始化：将当前主题同步到 <html data-theme>（不重复写 localStorage） */
    init() {
      document.documentElement.setAttribute('data-theme', this.mode)
    },
    toggle() {
      this.set(this.isDark ? 'light' : 'dark')
    },
    set(mode: ThemeMode) {
      this.mode = mode
      document.documentElement.setAttribute('data-theme', mode)
      try {
        localStorage.setItem(THEME_STORAGE_KEY, mode)
      } catch {
        /* 持久化失败不阻塞 UI */
      }
    },
  },
})
