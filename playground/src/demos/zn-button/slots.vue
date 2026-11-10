<!-- 插槽优先于同名的 prop -->
<script setup lang="ts">
import { ZnButton } from '@zhzwz/z/components/zn-button'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
</script>

<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnButton label="来自 label" type="primary">
        来自默认插槽
      </ZnButton>
      <ZnButton icon="ic:round-add">
        <template #icon>
          <span>★</span>
        </template>
        来自 #icon 插槽
      </ZnButton>
    </div>
  </ZnConfigProvider>
</template>
