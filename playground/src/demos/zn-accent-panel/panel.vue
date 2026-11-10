<!-- 色块直接铺在页面上 -->
<script setup lang="ts">
import { ZnAccentPanel } from '@zhzwz/z/components/zn-accent-panel'
import { ZnButton } from '@zhzwz/z/components/zn-button'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
</script>

<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnAccentPanel />
      <ZnButton type="primary">主要按钮</ZnButton>
    </div>
  </ZnConfigProvider>
</template>
