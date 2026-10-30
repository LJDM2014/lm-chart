<script setup lang="ts">
/** 404 兜底页：未匹配的路由统一落到这里 */
</script>

<template>
  <div class="not-found">
    <p class="code">404</p>
    <h1>页面不存在</h1>
    <p class="hint">你访问的地址可能已被移动或删除，回画廊看看吧。</p>
    <div class="actions">
      <router-link class="btn primary" to="/">返回首页</router-link>
      <router-link class="btn" to="/gallery">浏览画廊</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 62vh;
  text-align: center;
}

.code {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-soft, #8f6bf7));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

h1 {
  margin: var(--space-4) 0 var(--space-2);
  font-size: 22px;
}

.hint {
  margin: 0 0 var(--space-6);
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  gap: var(--space-3);
}

.btn {
  padding: 9px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  text-decoration: none;
  font-size: 14px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.btn:hover {
  border-color: var(--color-primary);
}

.btn.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
</style>
