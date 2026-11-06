// 以使用方的身份对产物做类型检查，见 test/dist.test.ts。
import type { ZButtonProps } from '@zhzwz/z/components/z-button'
import type { ZFlexProps } from '@zhzwz/z/components/z-flex'
import type { ZIconProps } from '@zhzwz/z/components/z-icon'
import type { ZnButtonProps } from '@zhzwz/z/components/zn-button'
import { ZButton } from '@zhzwz/z/components/z-button'
import { ZFlex } from '@zhzwz/z/components/z-flex'
import { ZFlexCol } from '@zhzwz/z/components/z-flex-col'
import { ZIcon } from '@zhzwz/z/components/z-icon'
import { ZnButton } from '@zhzwz/z/components/zn-button'

export const components = [
  ZButton,
  ZFlex,
  ZFlexCol,
  ZIcon,
  ZnButton,
]

export const buttonProps: ZButtonProps = {}
export const flexProps: ZFlexProps = { gap: 0.5, place: 'between center' }
export const iconProps: ZIconProps = { icon: 'ic:round-add' }
export const znButtonProps: ZnButtonProps = { icon: 'ic:round-add', label: '新建', type: 'primary' }

// @ts-expect-error label 只接受字符串
export const invalidZnButtonProps: ZnButtonProps = { label: 1 }

// @ts-expect-error place 只接受约定的对齐方式
export const invalidFlexProps: ZFlexProps = { place: 'middle' }
