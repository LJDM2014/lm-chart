<script setup lang="ts">
import ApexChart from '@/components/ApexChart.vue'
import { buildConfig } from './config'
</script>

<template>
  <ApexChart :build-config="buildConfig" />
</template>
