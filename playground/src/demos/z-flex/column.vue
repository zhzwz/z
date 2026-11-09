<!-- 纵向排列 -->
<script setup lang="ts">
import { ZFlex } from '@zhzwz/z/components/z-flex'
</script>

<template>
  <ZFlex column :gap="0.5" place="start">
    <span>第一行</span>
    <span>第二行</span>
  </ZFlex>
</template>
