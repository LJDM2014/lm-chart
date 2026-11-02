<script setup lang="ts">
import EchartsChart from '@/components/EchartsChart.vue'
import { buildOption } from './config'

// echarts-gl 提供 scatter3D / grid3D，挂载前按需加载（独立 chunk）
const plugins = [() => import('echarts-gl')]
</script>

<template>
  <EchartsChart :build-option="buildOption" :plugins="plugins" />
</template>
