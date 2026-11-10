<!-- 单选，没有选中时是 null -->
<script setup lang="ts">
import { ZnConfigProvider } from '@zhzwz/z/components/zn-config-provider'
import { ZnRadioGroup } from '@zhzwz/z/components/zn-radio-group'
import { NRadio } from 'naive-ui'
import { ref } from 'vue'

const choice = ref<string | null>(null)
</script>

<template>
  <ZnConfigProvider>
    <div class="stack">
      <ZnRadioGroup v-model="choice">
        <div class="row">
          <NRadio value="yes">
            是
          </NRadio>
          <NRadio value="no">
            否
          </NRadio>
        </div>
      </ZnRadioGroup>
      <p class="note">
        值：{{ choice === null ? 'null' : choice }}
      </p>
    </div>
  </ZnConfigProvider>
</template>
