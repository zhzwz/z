// 以使用方的身份对产物做类型检查，见 test/dist.test.ts。
import type { ZButtonProps } from '@zhzwz/z/components/z-button'
import type { ZIconProps } from '@zhzwz/z/components/z-icon'
import type { ZnButtonProps } from '@zhzwz/z/components/zn-button'
import { ZButton } from '@zhzwz/z/components/z-button'
import { ZIcon } from '@zhzwz/z/components/z-icon'
import { ZnButton } from '@zhzwz/z/components/zn-button'

export const components = [ZButton, ZIcon, ZnButton]

export const buttonProps: ZButtonProps = {}
export const iconProps: ZIconProps = { icon: 'ic:round-add' }
export const znButtonProps: ZnButtonProps = { icon: 'ic:round-add', label: '新建', type: 'primary' }

// @ts-expect-error label 只接受字符串
export const invalidZnButtonProps: ZnButtonProps = { label: 1 }
