<!-- 改 <html data-z-accent>，整页强调色跟着变 -->
<script setup lang="ts">
import { zAccentSteps } from '@zhzwz/z/accent'
import { ZnAccentSwitch } from '@zhzwz/z/components/zn-accent-switch'
import { ZnButton } from '@zhzwz/z/components/zn-button'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
</script>

<template>
  <ZnConfigProvider>
    <div class="stack panel">
      <div class="row">
        <ZnAccentSwitch />
        <ZnButton type="primary">主要按钮</ZnButton>
      </div>
      <div class="scale">
        <span
          v-for="step in zAccentSteps"
          :key="step"
          :style="{ background: `var(--z-theme-accent-${step})` }"
          :title="String(step)"
        />
      </div>
    </div>
  </ZnConfigProvider>
</template>

<style scoped>
.scale {
  display: flex;
  gap: 4px;
}

.scale span {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 4px;
}
</style>
