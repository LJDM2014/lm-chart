<script setup lang="ts">
import G6Chart from '@/components/G6Chart.vue'
import { buildSpec } from './config'
</script>

<template>
  <G6Chart :build-spec="buildSpec" />
</template>
