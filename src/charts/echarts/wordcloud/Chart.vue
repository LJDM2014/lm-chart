<script setup lang="ts">
import EchartsChart from '@/components/EchartsChart.vue'
import { buildOption } from './config'

const plugins = [() => import('echarts-wordcloud')]
</script>

<template>
  <EchartsChart :build-option="buildOption" :plugins="plugins" />
</template>
