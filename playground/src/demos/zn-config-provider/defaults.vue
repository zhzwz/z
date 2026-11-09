<!-- 内置默认值，以及显式 props 优先 -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnInput } from '@zhzwz/z/components/zn-input'
import NaiveTheme from '@/components/NaiveTheme.vue'
</script>

<template>
  <ZnConfigProvider :defaults="{ ZnInput: { clearable: false } }">
    <NaiveTheme>
      <div class="stack panel">
        <ZnInput placeholder="默认值把清空关掉了" />
        <ZnInput clearable placeholder="这里显式打开清空" />
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
