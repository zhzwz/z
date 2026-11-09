<!-- 多选，值是数组 -->
<script setup lang="ts">
import { ZnCheckbox } from '@zhzwz/z/components/zn-checkbox'
import { ZnCheckboxGroup } from '@zhzwz/z/components/zn-checkbox-group'
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const permissions = ref<string[]>([])
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
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
    </NaiveTheme>
  </ZnConfigProvider>
</template>
