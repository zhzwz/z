<!-- 点一下，整页强调色跟着变 -->
<script setup lang="ts">
import { ZnAccentSwitch } from '@zhzwz/z/components/zn-accent-switch'
import { ZnButton } from '@zhzwz/z/components/zn-button'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
</script>

<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnAccentSwitch />
      <ZnButton type="primary">主要按钮</ZnButton>
    </div>
  </ZnConfigProvider>
</template>
