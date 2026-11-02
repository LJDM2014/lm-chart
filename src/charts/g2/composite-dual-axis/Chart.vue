<script setup lang="ts">
import G2Chart from '@/components/G2Chart.vue'
import { buildSpec } from './config'
</script>

<template>
  <G2Chart :build-spec="buildSpec" />
</template>
