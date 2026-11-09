<!-- 纵向弹性布局 -->
<script setup lang="ts">
import { ZFlexCol } from '@zhzwz/z/components/z-flex-col'
</script>

<template>
  <ZFlexCol class="panel" :gap="0.75" place="stretch">
    <span>标题</span>
    <span>说明文字</span>
  </ZFlexCol>
</template>
