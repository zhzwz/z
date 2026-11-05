<!-- 传入组件，如 unplugin-icons 生成的图标 -->
<script setup lang="ts">
import { ZIcon } from '@zhzwz/z/components/z-icon'
import { h } from 'vue'

function IconDot() {
  return h('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, [
    h('circle', {
      cx: 12,
      cy: 12,
      fill: 'currentColor',
      r: 6,
    }),
  ])
}
</script>

<template>
  <div class="row icons">
    <ZIcon :icon="IconDot" />
    <ZIcon color="#1a7f37" :icon="IconDot" />
  </div>
</template>
