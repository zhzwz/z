<script lang="ts">
import type { FormItemInst, FormItemRule } from 'naive-ui'
import type { ExtractPublicPropTypes, PropType, VNode } from 'vue'
import type { ZnFormItemCheck, ZnFormPath } from '../zn-form/context'
import { formItemProps, NFormItem } from 'naive-ui'
import { inject, onBeforeUnmount, onMounted, provide, ref, useTemplateRef, watch } from 'vue'
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
/** 本字段的空值，由字段组件声明（如开关把 false 也算空）；默认是 undefined / null / '' */
const emptyValues = ref<readonly unknown[]>(defaultEmptyValues)

function bindings() {
  const { path, defaultValue } = resolvedProps()
  if (typeof path === 'string') {
    return [
      { dataPath: path, defaultValue },
    ]
  }
  if (typeof path !== 'object' || path === null) {
    return []
  }
  const defaults = (defaultValue ?? {}) as Record<string, unknown>
  return Object.entries(path).flatMap(([model, dataPath]) => {
    if (typeof dataPath !== 'string') {
      return []
    }
    return [
      {
        dataPath,
        defaultValue: defaults[model],
      },
    ]
  })
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
  let changed = false
  for (const { dataPath, defaultValue } of bindings()) {
    const current = getPath(model, dataPath)
    const empty = isEmptyValue(current, emptyValues.value)
    if (defaultValue === undefined) {
      // 挂载时（onlyEmpty）没有 defaultValue 的字段一概不动，否则会把初始数据清掉。
      // 重置时只把有值的字段恢复成空值：原本就是空的保持原样，'' 不会被改成 null。
      if (!onlyEmpty && !empty) {
        changed = writePath(model, dataPath, current, toEmptyValue(current)) || changed
      }
      continue
    }
    if (!onlyEmpty || empty) {
      // 深拷贝：defaultValue 常来自共享的 schema，直接赋引用会让多行数据共用一个对象，
      // 改一行连带改另一行，还会反向污染 schema 本身。
      changed = writePath(model, dataPath, current, cloneData(defaultValue)) || changed
    }
  }
  if (changed) {
    form?.notifyChange()
  }
}

function writePath(model: Record<string, unknown>, dataPath: string, current: unknown, next: unknown) {
  if (Object.is(current, next)) {
    return false
  }
  setPath(model, dataPath, next)
  return true
}

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

// 子组件在自己的 setup 里声明空值，晚于这次调用。先按默认空值填一遍，挂载后再补一次，
// 这样开关的 false 也能吃到 defaultValue，服务端渲染时第一遍已经写好，不会和客户端首次渲染错开。
fillDefaults(true)
onMounted(() => fillDefaults(true))

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
    // 组件自带的校验更具体（如日期范围只有一端），要先于「不能为空」，否则必填会把它盖掉。
    for (const check of checks) {
      const message = check()
      if (message) {
        return new Error(message)
      }
    }
    if (required && toDataPaths(path).some(dataPath => isEmptyValue(getPath(model, dataPath), emptyValues.value))) {
      return new Error(label
        ? `${label}不能为空`
        : '不能为空')
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
/**
 * 按 naive / async-validator 的两种写法收结果。
 * 返回 Error、false、Error[] 算失败；Promise 兑现算通过（兑现的值不再解读），拒绝算失败。
 * 声明了 callback 又没有返回值时，等到 callback 被调用再收结果，包括函数返回之后才调用的情况。
 * 没有声明 callback、也没有返回值时视为通过。声明了却既不返回也不调用时会一直等，和 async-validator 一样。
 */
async function runValidator(rule: FormItemRule, value: unknown, dataPath: string) {
  const validate = rule.validator
  if (!validate) {
    return
  }
  await new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (error?: Error) => {
      if (settled) {
        return
      }
      settled = true
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    }
    const finishCallback = (error?: unknown) => {
      const value = Array.isArray(error)
        ? error[0]
        : error
      if (value instanceof Error) {
        finish(value)
        return
      }
      if (typeof value === 'string' && value) {
        finish(new Error(value))
        return
      }
      finish()
    }
    const finishReturn = (returned: unknown) => {
      if (returned === false) {
        finish(new Error(ruleMessage(rule, dataPath)))
        return
      }
      const value = Array.isArray(returned)
        ? returned[0]
        : returned
      finish(value instanceof Error
        ? value
        : undefined)
    }
    let returned: unknown
    try {
      returned = validate(rule, value, finishCallback, {}, {} as never)
    } catch (error) {
      finish(error instanceof Error
        ? error
        : new Error(String(error)))
      return
    }
    if (settled) {
      return
    }
    if (isThenable(returned)) {
      returned.then(() => finish(), (error: unknown) => {
        finish(error instanceof Error
          ? error
          : new Error(String(error)))
      })
      return
    }
    if (returned === undefined && validate.length < 3) {
      finish()
      return
    }
    if (returned !== undefined) {
      finishReturn(returned)
    }
  })
}

function isThenable(value: unknown): value is Promise<unknown> {
  return typeof (value as Promise<unknown> | null)?.then === 'function'
}

/**
 * 每条原始规则单独交给 NFormItem，才能保留它自己的 trigger 和 level。
 * 合成一条总规则的话，blur 规则会在 input 时跑，warning 也会变成 error。
 */
function objectPathRules(): FormItemRule[] {
  const { path } = resolvedProps()
  const all = form?.rules()
  if (typeof path !== 'object' || path === null || !all) {
    return []
  }
  const model = () => form?.model() ?? {}
  return Object.values(path).flatMap((dataPath) => {
    if (typeof dataPath !== 'string') {
      return []
    }
    return toRuleList(getPath(all, dataPath)).map((rule) => {
      const unsupported = Object.keys(rule).filter(key => !supportedRuleKeys.has(key))
      if (unsupported.length > 0) {
        return {
          trigger: rule.trigger ?? ['input', 'change', 'blur'],
          // 返回 Error 而不是抛出：naive 会把校验函数里的同步异常吞掉，规则就静默通过了。
          validator() {
            return new Error(`[ZnForm] path 为对象时，${dataPath} 的规则只支持 ${[...supportedRuleKeys].join('、')}，收到 ${unsupported.join('、')}；其余写法请改用 validator。`)
          },
        }
      }
      return {
        key: rule.key,
        level: rule.level,
        trigger: rule.trigger ?? ['input', 'change', 'blur'],
        async validator() {
          const value = getPath(model(), dataPath)
          if (rule.required && isEmptyValue(value, emptyValues.value)) {
            throw new Error(ruleMessage(rule, dataPath))
          }
          await runValidator(rule, value, dataPath)
        },
      }
    })
  })
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
  return [
    builtinRule,
    ...(resolvedProps().rules ?? []),
    ...objectPathRules(),
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
