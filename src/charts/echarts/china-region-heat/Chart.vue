<script setup lang="ts">
import EchartsChart from '@/components/EchartsChart.vue'
import { buildOption } from './config'
import { ensureChinaMap } from '@/adapters/geoMap'
</script>

<template>
  <EchartsChart :build-option="buildOption" :plugins="[ensureChinaMap]" />
</template>
