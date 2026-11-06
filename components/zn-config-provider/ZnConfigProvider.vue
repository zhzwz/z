<script lang="ts">
import type { ExtractPublicPropTypes, PropType } from 'vue'
import type { ZnDefaults } from './config'
import {
  configProviderProps,
  dateZhCN,
  NConfigProvider,
  NDialogProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  zhCN,
} from 'naive-ui'
import { computed, provide, useAttrs } from 'vue'
import { mergeDefaults, useZnConfig, znConfigKey } from './config'

/** 最外层 ZnConfigProvider 内置的组件默认值；`defaults` 按组件合并覆盖 */
export const znBuiltinDefaults: ZnDefaults = {
  ZnDate: {
    clearable: true,
    actions: null,
    fastYearSelect: true,
    fastMonthSelect: true,
  },
  ZnDateRange: { clearable: true, fastYearSelect: true, fastMonthSelect: true },
  ZnDateTime: { clearable: true, fastYearSelect: true, fastMonthSelect: true },
  ZnInput: { clearable: true },
  ZnInputNumber: { clearable: true },
  ZnSelect: { clearable: true, filterable: true },
  ZnSelectMulti: { clearable: true, filterable: true },
  ZnSwitch: { round: false },
  ZnTextarea: { clearable: true },
}

export const znConfigProviderProps = {
  ...configProviderProps,
  abstract: {
    type: Boolean,
    default: true,
  },
  inlineThemeDisabled: {
    type: Boolean,
    default: true,
  },
  /** 各 Zn* 组件的默认 props，按组件合并：内层覆盖外层，最外层覆盖内置默认值 */
  defaults: Object as PropType<ZnDefaults>,
} as const

export type ZnConfigProviderProps = ExtractPublicPropTypes<typeof znConfigProviderProps>
</script>

<script setup lang="ts">
// 根节点是多分支的 Provider 和 teleport，attrs 不会自动继承；显式转发到上面的宿主元素。
defineOptions({ inheritAttrs: false })
const props = defineProps(znConfigProviderProps)
defineSlots<{
  default?: () => unknown
}>()

const outer = useZnConfig()
const attrs = useAttrs()

provide(znConfigKey, computed(() => ({
  defaults: mergeDefaults(outer?.value.defaults ?? znBuiltinDefaults, props.defaults),
})))

// 语言包只在最外层默认中文；内层不传时由 naive 继承外层。传 null 表示用 naive 自带的英文。
const nConfigProviderProps = computed(() => {
  const { defaults, ...rest } = props
  if (outer) {
    return rest
  }
  return {
    ...rest,
    locale: rest.locale === undefined
      ? zhCN
      : rest.locale,
    dateLocale: rest.dateLocale === undefined
      ? dateZhCN
      : rest.dateLocale,
  }
})
</script>

<template>
  <NConfigProvider v-bind="nConfigProviderProps">
    <!--
      根是多分支的 Provider，`abstract` 下它们都不渲染元素，class / style 等 attrs 无处可落（Vue 会警告丢失）。
      这里给每一分支一个真实的宿主元素承载 attrs。
    -->
    <div v-if="outer" v-bind="attrs" class="zn-config-provider">
      <slot />
    </div>
    <NLoadingBarProvider v-else>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <div v-bind="attrs" class="zn-config-provider">
              <slot />
            </div>
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>

<style>
/* 宿主元素只用来承载 attrs，不参与布局 */
.zn-config-provider {
  display: contents;
}
</style>
