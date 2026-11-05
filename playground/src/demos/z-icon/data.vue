<!-- 传入图标数据，不联网 -->
<script setup lang="ts">
import { ZIcon } from '@zhzwz/z/components/z-icon'

// 最小的图标数据：24×24 的方块。
const square = {
  body: '<path fill="currentColor" d="M3 3h18v18H3z"/>',
  height: 24,
  width: 24,
}
</script>

<template>
  <div class="row icons">
    <ZIcon :icon="square" />
    <ZIcon color="#0969da" :icon="square" />
  </div>
</template>
