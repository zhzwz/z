<!-- 单个勾选框 -->
<script setup lang="ts">
import { ref } from 'vue'

const agreed = ref(false)
</script>

<template>
  <ZnConfigProvider>
    <div class="row">
      <ZnCheckbox v-model="agreed">
        我已阅读
      </ZnCheckbox>
      <span class="note">{{ agreed }}</span>
    </div>
  </ZnConfigProvider>
</template>
