<script setup lang="ts">
import ChartjsChart from '@/components/ChartjsChart.vue'
import { buildConfig } from './config'
</script>

<template>
  <ChartjsChart :build-config="buildConfig" />
</template>
