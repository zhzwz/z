<script lang="ts">
import type { ExtractPublicPropTypes, PropType } from 'vue'
import type { ZAccentName, ZAccentStep } from '../accent'
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
import { computed, onMounted, onUnmounted, provide, ref } from 'vue'
import { installZAccentStyle, readZAccent, setZAccent, zAccentDefault, zAccentHex } from '../accent'
import { mergeDefaults, useZnConfig, znConfigKey } from './config'
import { useFollowedTheme } from './theme'

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
// 根是不渲染元素的 Provider。未声明的 class、style 等不接收，避免开发环境报丢失属性。
defineOptions({ inheritAttrs: false })
const props = defineProps(znConfigProviderProps)
defineSlots<{
  default?: () => unknown
}>()

const outer = useZnConfig()
const followedTheme = useFollowedTheme(!outer)
const attributeAccent = ref<ZAccentName>(zAccentDefault)
let accentObserver: MutationObserver | undefined

provide(znConfigKey, computed(() => ({
  defaults: mergeDefaults(outer?.value.defaults ?? znBuiltinDefaults, props.defaults),
})))

function syncAccent() {
  const written = readZAccent()
  const next = written ?? zAccentDefault
  attributeAccent.value = next
  if (written !== next) {
    setZAccent(next)
  }
}

onMounted(() => {
  if (outer) {
    return
  }
  installZAccentStyle()
  syncAccent()
  accentObserver = new MutationObserver(syncAccent)
  accentObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-z-accent'],
  })
})

onUnmounted(() => {
  accentObserver?.disconnect()
})

const accentOnLight = {
  base: 600,
  hover: 500,
  pressed: 700,
  suppl: 500,
} as const satisfies Record<string, ZAccentStep>
const accentOnDark = {
  base: 400,
  hover: 300,
  pressed: 500,
  suppl: 600,
} as const satisfies Record<string, ZAccentStep>

function accentPrimaryColors(name: ZAccentName, mode: 'dark' | 'light') {
  const step = mode === 'dark'
    ? accentOnDark
    : accentOnLight
  return {
    primaryColor: zAccentHex(name, step.base),
    primaryColorHover: zAccentHex(name, step.hover),
    primaryColorPressed: zAccentHex(name, step.pressed),
    primaryColorSuppl: zAccentHex(name, step.suppl),
  }
}

// 语言包和主题只在最外层给默认值；内层不传时由 naive 继承外层。
// 语言包传 null 表示用 naive 自带的英文。theme 传 null 表示浅色，传了 theme 就不再读 data-z-theme。
// 强调色只读 data-z-accent。没写或不认识时用 zAccentDefault，并写回这个属性。挂载前先用默认值，避免服务端和客户端首屏不一致。
const nConfigProviderProps = computed(() => {
  const { defaults, themeOverrides, ...rest } = props
  if (outer) {
    return { ...rest, themeOverrides }
  }
  const theme = rest.theme === undefined
    ? followedTheme.value
    : rest.theme
  return {
    ...rest,
    locale: rest.locale === undefined
      ? zhCN
      : rest.locale,
    dateLocale: rest.dateLocale === undefined
      ? dateZhCN
      : rest.dateLocale,
    theme,
    themeOverrides: {
      ...themeOverrides,
      common: {
        ...accentPrimaryColors(attributeAccent.value, themeName(theme) === 'dark'
          ? 'dark'
          : 'light'),
        ...themeOverrides?.common,
      },
    },
  }
})

function themeName(theme: unknown) {
  if (theme && typeof theme === 'object' && 'name' in theme) {
    return theme.name
  }
  return null
}
</script>

<template>
  <NConfigProvider v-bind="nConfigProviderProps">
    <slot v-if="outer" />
    <NLoadingBarProvider v-else>
      <NDialogProvider>
        <NNotificationProvider>
          <NMessageProvider>
            <slot />
          </NMessageProvider>
        </NNotificationProvider>
      </NDialogProvider>
    </NLoadingBarProvider>
  </NConfigProvider>
</template>
