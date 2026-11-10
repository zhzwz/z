<!-- 数字，没有值时是 null -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number | null>(1)
</script>

<template>
  <ZnConfigProvider>
    <div class="stack panel">
      <ZnInputNumber v-model="count" />
      <p class="note">
        值：{{ count === null ? 'null' : count }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
