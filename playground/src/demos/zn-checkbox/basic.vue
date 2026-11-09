<!-- 单个勾选框 -->
<script setup lang="ts">
import { ZnCheckbox } from '@zhzwz/z/components/zn-checkbox'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const agreed = ref(false)
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <div class="row">
        <ZnCheckbox v-model="agreed">
          我已阅读
        </ZnCheckbox>
        <span class="note">{{ agreed }}</span>
      </div>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
