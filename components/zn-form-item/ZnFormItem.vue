<script lang="ts">
import type { FormItemInst, FormItemRule } from 'naive-ui'
import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import type { ZnFormItemCheck, ZnFormPath } from '../zn-form/context'
import { formItemProps, NFormItem } from 'naive-ui'
import { inject, onBeforeUnmount, provide, ref, useTemplateRef, watch } from 'vue'
import { cloneData } from '../../shared/clone'
import { omit } from '../../shared/omit'
import { getPath, setPath } from '../../shared/path'
import { useZnDefaults } from '../zn-config-provider/config'
import { defaultEmptyValues, isEmptyValue, toColumnCount, toDataPaths, toItemPath, znFormItemKey, znFormKey } from '../zn-form/context'

export const znFormItemProps = {
  ...omit(formItemProps, ['path', 'rule', 'rulePath']),
  path: [String, Object] as PropType<ZnFormPath>,
  /** 额外的 naive 校验规则；path 为对象时 validator 收到的 value 是 undefined，需要自己读数据 */
  rules: Array as PropType<FormItemRule[]>,
  /** 占几列；超过 ZnForm 的列数时按列数算，非正整数按 1 算，小数向下取整 */
  span: Number,
  /** 显示在组件下方的说明 */
  help: String,
  /** 字段为空时填入的值，`reset` 也会恢复成它；形状与 path 一致 */
  defaultValue: null as unknown as PropType<unknown>,
} as const

export type ZnFormItemProps = ExtractPublicPropTypes<typeof znFormItemProps>
</script>

<script setup lang="ts">
const props = defineProps(znFormItemProps)
const slots = defineSlots<{
  default?: () => VNode[]
  feedback?: () => VNode[]
  label?: () => VNode[]
}>()
const resolvedProps = useZnDefaults('ZnFormItem', props, znFormItemProps)
const form = inject(znFormKey, null)
const formItem = useTemplateRef<FormItemInst>('formItem')
/** 表单项是否校验过（用户交互或提交过）；没校验过时不因外部赋值刷出红字 */
const touched = ref(false)

function bindings() {
  const { path, defaultValue } = resolvedProps()
  if (path === undefined) {
    return []
  }
  if (typeof path === 'string') {
    return [
      { dataPath: path, defaultValue },
    ]
  }
  const defaults = (defaultValue ?? {}) as Record<string, unknown>
  return Object.entries(path).map(([model, dataPath]) => ({ dataPath, defaultValue: defaults[model] }))
}

/** 没有 defaultValue 时按字段当前的形状取空值：多值为 []、开关为 false，其余为 null */
function toEmptyValue(current: unknown) {
  if (Array.isArray(current)) {
    return []
  }
  if (typeof current === 'boolean') {
    return false
  }
  return null
}

function fillDefaults(onlyEmpty: boolean) {
  const model = form?.model()
  if (!model) {
    return
  }
  for (const { dataPath, defaultValue } of bindings()) {
    const current = getPath(model, dataPath)
    if (defaultValue === undefined) {
      // 挂载时（onlyEmpty）没有 defaultValue 的字段一概不动，否则会把初始数据清掉。
      // 重置时只把有值的字段恢复成空值：原本就是空的保持原样，'' 不会被改成 null。
      if (!onlyEmpty && !isEmptyValue(current)) {
        setPath(model, dataPath, toEmptyValue(current))
      }
      continue
    }
    if (!onlyEmpty || isEmptyValue(current)) {
      // 深拷贝：defaultValue 常来自共享的 schema，直接赋引用会让多行数据共用一个对象，
      // 改一行连带改另一行，还会反向污染 schema 本身。
      setPath(model, dataPath, cloneData(defaultValue))
    }
  }
  form?.notifyChange()
}

fillDefaults(true)

if (form) {
  let unregister: (() => void) | undefined
  // 只认数据路径的字符串内容：父组件每次渲染传新的 path 对象字面量时，引用必变，按引用比较会每次注销再注册。
  const pathKey = () => {
    const itemPath = toItemPath(resolvedProps().path)
    const dataPaths = toDataPaths(resolvedProps().path)
    return itemPath === undefined
      ? undefined
      : `${itemPath}\u0000${dataPaths.join('\u0000')}`
  }
  watch(pathKey, (key) => {
    unregister?.()
    const path = resolvedProps().path
    unregister = key === undefined
      ? undefined
      : form.register({
          itemPath: toItemPath(path)!,
          dataPaths: toDataPaths(path),
          reset: () => {
            touched.value = false
            fillDefaults(false)
          },
        })
  }, { immediate: true })
  onBeforeUnmount(() => unregister?.())
}

const checks = new Set<ZnFormItemCheck>()
/** 本字段的空值，由字段组件声明（如开关把 false 也算空）；默认是 undefined / null / '' */
const emptyValues = ref<readonly unknown[]>(defaultEmptyValues)

provide(znFormItemKey, {
  addCheck(check) {
    checks.add(check)
    return () => checks.delete(check)
  },
  revalidate() {
    if (touched.value) {
      // 不带 trigger：值变了，所有规则都该重新评估。只跑 change 规则会让 blur 等规则的报错被清掉。
      formItem.value?.validate().catch(() => {})
    }
  },
  setEmptyValues(values) {
    emptyValues.value = values
  },
})

const builtinRule: FormItemRule = {
  trigger: ['input', 'change', 'blur'],
  validator() {
    touched.value = true
    const { label, required, path } = resolvedProps()
    const model = form?.model() ?? {}
    if (required && toDataPaths(path).some(dataPath => isEmptyValue(getPath(model, dataPath), emptyValues.value))) {
      return new Error(label
        ? `${label}不能为空`
        : '不能为空')
    }
    for (const check of checks) {
      const message = check()
      if (message) {
        return new Error(message)
      }
    }
    return true
  },
}

function nFormItemProps() {
  const { path, rules, span, help, defaultValue, ...rest } = resolvedProps()
  return rest
}

/**
 * naive 只按 `path` 从 `NForm` 的 rules 里取值：`path` 为对象时交上去的是 `from,to` 这样的拼接串，
 * 查不到任何规则，于是自定义校验和 `required` 简写都静默失效。
 *
 * 这里自己按数据路径逐条跑，并把真实值交给规则（naive 那条路上 validator 只会收到 undefined）。
 * 只认 `required` / `validator` 两种写法：其余写法（`min`、`pattern`、`type` 等）由 async-validator 实现，
 * 在这里无法完整复刻，遇到时直接报错说明，避免又一次静默通过。
 */
function objectPathRule(): FormItemRule {
  return {
    trigger: ['input', 'change', 'blur'],
    async validator() {
      const { path } = resolvedProps()
      const all = form?.rules()
      if (typeof path !== 'object' || path === null || !all) {
        return
      }
      const dataPaths = Object.values(path)
      const model = form?.model() ?? {}
      for (const dataPath of dataPaths) {
        for (const rule of toRuleList(getPath(all, dataPath))) {
          const value = getPath(model, dataPath)
          const unsupported = Object.keys(rule).filter(key => !supportedRuleKeys.has(key))
          if (unsupported.length > 0) {
            throw new Error(`[ZnForm] path 为对象时，${dataPath} 的规则只支持 ${[...supportedRuleKeys].join('、')}，收到 ${unsupported.join('、')}；其余写法请改用 validator。`)
          }
          if (rule.required && isEmptyValue(value, emptyValues.value)) {
            throw new Error(ruleMessage(rule, dataPath))
          }
          if (rule.validator) {
            const result = await rule.validator(rule, value, () => {}, {}, {} as never)
            const error = Array.isArray(result)
              ? result[0]
              : result
            if (error instanceof Error) {
              throw error
            }
            if (result === false) {
              throw new Error(ruleMessage(rule, dataPath))
            }
          }
        }
      }
    },
  }
}

/** 规则的 `message` 允许写成函数，统一取成字符串 */
function ruleMessage(rule: FormItemRule, dataPath: string) {
  const { message } = rule
  if (typeof message === 'function') {
    return String(message(dataPath))
  }
  return message ?? requiredMessage(dataPath)
}

const supportedRuleKeys = new Set([
  'required',
  'message',
  'trigger',
  'validator',
  'level',
  'key',
])

function toRuleList(rule: unknown): FormItemRule[] {
  if (Array.isArray(rule)) {
    return rule as FormItemRule[]
  }
  return rule === undefined
    ? []
    : [rule as FormItemRule]
}

function requiredMessage(dataPath: string) {
  const { label } = resolvedProps()
  return label
    ? `${label}不能为空`
    : `${dataPath}不能为空`
}

function itemRules() {
  const path = resolvedProps().path
  return [
    builtinRule,
    ...(resolvedProps().rules ?? []),
    ...(typeof path === 'object' && path !== null
      ? [
          objectPathRule(),
        ]
      : []),
  ]
}

function gridColumn() {
  const { span } = resolvedProps()
  if (!form || span === undefined) {
    return undefined
  }
  return `span ${Math.min(toColumnCount(span), form.cols())}`
}

const namedSlots = () => (Object.keys(slots) as (keyof typeof slots)[]).filter(name => name !== 'default')
</script>

<template>
  <NFormItem
    ref="formItem"
    v-bind="nFormItemProps()"
    :path="toItemPath(resolvedProps().path)"
    :rule="itemRules()"
    :style="{ gridColumn: gridColumn() }"
  >
    <template v-for="name in namedSlots()" #[name]>
      <slot :name="name" />
    </template>
    <template #default>
      <div v-if="resolvedProps().help" class="zn-form-item__content">
        <slot />
        <div class="zn-form-item__help">{{ resolvedProps().help }}</div>
      </div>
      <slot v-else />
    </template>
  </NFormItem>
</template>

<style>
.zn-form-item__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.zn-form-item__help {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.6;
}
</style>
