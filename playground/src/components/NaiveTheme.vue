<!-- 让演示里的 naive-ui 组件跟随站点的深浅色 -->
<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { useNaiveTheme } from '@/naive.ts'

const theme = useNaiveTheme()
</script>

<template>
  <NConfigProvider :theme="theme">
    <slot />
  </NConfigProvider>
</template>
