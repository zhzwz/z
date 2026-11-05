<script lang="ts">
import type { ButtonSlots } from 'naive-ui'
import type { ExtractPublicPropTypes, PropType } from 'vue'
import type { ZIconProps } from '../z-icon'
import { buttonProps, NButton } from 'naive-ui'
import { computed, onMounted, onUpdated, useAttrs, warn } from 'vue'
import { ZIcon } from '../z-icon'

export const znButtonProps = {
  ...buttonProps,
  /** 图标，用法同 ZIcon；`#icon` 插槽优先 */
  icon: [String, Object, Function] as PropType<ZIconProps['icon']>,
  /** 按钮文字；默认插槽优先 */
  label: String,
} as const

export type ZnButtonProps = ExtractPublicPropTypes<typeof znButtonProps>
</script>

<script setup lang="ts">
const props = defineProps(znButtonProps)

// slots 不是响应式对象，不能放进 computed，否则父组件增减插槽后不会更新。
const slots = defineSlots<ButtonSlots>()
const slotNames = () => Object.keys(slots) as (keyof ButtonSlots)[]

const nButtonProps = computed(() => {
  const { icon, label, ...rest } = props
  return rest
})

function hasIconWithoutText() {
  const hasIcon = Boolean(slots.icon || props.icon || props.renderIcon)
  const hasText = Boolean(slots.default || props.label)
  return hasIcon && !hasText
}

function iconOnly() {
  return hasIconWithoutText() && !props.text
}

const attrs = useAttrs()
const nameAttrs = ['aria-label', 'aria-labelledby', 'title']

let warnedMissingName = false
function warnMissingName() {
  if (warnedMissingName || !hasIconWithoutText() || nameAttrs.some(name => attrs[name])) {
    return
  }
  warnedMissingName = true
  warn('[ZnButton] 只有图标的按钮需要可访问的名称，读屏软件才能读出它，例如 <ZnButton icon="ic:round-search" aria-label="搜索" />。')
}
onMounted(warnMissingName)
onUpdated(warnMissingName)
</script>

<template>
  <NButton v-bind="nButtonProps" :class="{ 'zn-button--icon-only': iconOnly() }">
    <template v-for="name in slotNames()" #[name]>
      <slot :name="name" />
    </template>
    <template v-if="!$slots.icon && icon" #icon>
      <ZIcon :icon="icon" />
    </template>
    <template v-if="!$slots.default && label" #default>
      {{ label }}
    </template>
  </NButton>
</template>

<style>
.zn-button--icon-only {
  width: var(--n-height);
  padding: 0;
}
</style>
