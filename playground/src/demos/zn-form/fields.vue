<!-- 模板里写表单项 -->
<script setup lang="ts">
import type { ZnFormData } from '@zhzwz/z/components/zn-form'
import { ref } from 'vue'

const data = ref({
  name: '',
  start: null as string | null,
  end: null as string | null,
})
const result = ref('')

function save(copy: ZnFormData) {
  result.value = JSON.stringify(copy)
}
</script>

<template>
  <ZnConfigProvider>
    <ZnForm v-model="data" class="panel" :cols="2" @submit="save">
      <ZnFormItem label="名称" path="name" required>
        <ZnInput v-model="data.name" />
      </ZnFormItem>
      <ZnFormItem label="有效期" :path="{ start: 'start', end: 'end' }" required>
        <ZnDateRange v-model:end="data.end" v-model:start="data.start" />
      </ZnFormItem>
      <ZnFormItem :span="2">
        <ZnButton attr-type="submit" type="primary">
          提交
        </ZnButton>
      </ZnFormItem>
    </ZnForm>
    <p v-if="result" class="note">
      {{ result }}
    </p>
  </ZnConfigProvider>
</template>
