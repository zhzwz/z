<!-- 只有开和关 -->
<script setup lang="ts">
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
