import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useThemeStore } from '@/stores/theme'
import '@/styles/tokens.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 应用挂载前同步主题状态（index.html 内联脚本已提前设置 data-theme，此处保持 store 一致）
useThemeStore().init()

app.mount('#app')
