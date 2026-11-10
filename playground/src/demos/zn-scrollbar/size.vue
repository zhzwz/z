<!-- 指定滚动条粗细 -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnScrollbar } from '@zhzwz/z/components/zn-scrollbar'
</script>

<template>
  <ZnConfigProvider>
    <ZnScrollbar class="scroll-box panel" :size="8">
      <p v-for="index in 12" :key="index">
        第 {{ index }} 行
      </p>
    </ZnScrollbar>
  </ZnConfigProvider>
</template>
