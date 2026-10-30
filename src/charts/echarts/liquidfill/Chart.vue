<script setup lang="ts">
import EchartsChart from '@/components/EchartsChart.vue'
import { buildOption } from './config'

// 扩展插件在挂载前按需加载
const plugins = [() => import('echarts-liquidfill')]
</script>

<template>
  <EchartsChart :build-option="buildOption" :plugins="plugins" />
</template>
