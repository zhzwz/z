<!-- 占列、必填和说明 -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnForm } from '@zhzwz/z/components/zn-form'
import { ZnFormItem } from '@zhzwz/z/components/zn-form-item'
import { ZnInput } from '@zhzwz/z/components/zn-input'
import { ZnTextarea } from '@zhzwz/z/components/zn-textarea'
import { ref } from 'vue'
import NaiveTheme from '@/components/NaiveTheme.vue'

const data = ref({
  name: '',
  city: '',
  note: null as string | null,
})
</script>

<template>
  <ZnConfigProvider>
    <NaiveTheme>
      <ZnForm v-model="data" class="panel" :cols="2">
        <ZnFormItem help="对外显示的名字" label="名称" path="name" required>
          <ZnInput v-model="data.name" />
        </ZnFormItem>
        <ZnFormItem label="城市" path="city">
          <ZnInput v-model="data.city" />
        </ZnFormItem>
        <ZnFormItem label="备注" path="note" :span="2">
          <ZnTextarea v-model="data.note" />
        </ZnFormItem>
      </ZnForm>
    </NaiveTheme>
  </ZnConfigProvider>
</template>
