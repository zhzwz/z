<!-- 只有开和关 -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnSwitch } from '@zhzwz/z/components/zn-switch'
import { ref } from 'vue'

const enabled = ref(false)
</script>

<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnSwitch v-model="enabled" />
      <span class="note">{{ enabled }}</span>
    </div>
  </ZnConfigProvider>
</template>
