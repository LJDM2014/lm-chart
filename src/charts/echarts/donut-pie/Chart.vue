<script setup lang="ts">
import EchartsChart from '@/components/EchartsChart.vue'
import { buildOption } from './config'
</script>

<template>
  <EchartsChart :build-option="buildOption" />
</template>
