<!-- 多选，值是数组 -->
<script setup lang="ts">
import { ref } from 'vue'

const permissions = ref<string[]>([])
</script>

<template>
  <ZnConfigProvider>
    <div class="stack">
      <ZnCheckboxGroup v-model="permissions">
        <div class="row">
          <ZnCheckbox value="read">
            阅读
          </ZnCheckbox>
          <ZnCheckbox value="write">
            写入
          </ZnCheckbox>
        </div>
      </ZnCheckboxGroup>
      <p class="note">
        {{ JSON.stringify(permissions) }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
