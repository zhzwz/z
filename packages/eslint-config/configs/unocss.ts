import { statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'

const UNO_CONFIG_NAMES = ['uno.config', 'unocss.config']
// 与 unconfig 的 defaultExtensions 保持一致，空字符串表示无扩展名。
const UNO_CONFIG_EXTENSIONS = [
  'mts',
  'cts',
  'ts',
  'mjs',
  'cjs',
  'js',
  'json',
  '',
]

// 向上查找会经过无权访问的祖先目录，EACCES 等错误一律视为不存在。
function isFile(path: string): boolean {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

function hasUnoConfigIn(directory: string): boolean {
  return UNO_CONFIG_NAMES.some(name =>
    UNO_CONFIG_EXTENSIONS.some(extension =>
      isFile(join(directory, extension
        ? `${name}.${extension}`
        : name)),
    ),
  )
}

// @unocss/eslint-plugin 从被检查文件所在目录向上查找配置，找不到会直接抛错而不是报告问题。
// 这里同样向上查找，只能覆盖配置位于 cwd 或其祖先目录的情况。
export function hasUnoConfig(cwd: string = process.cwd()): boolean {
  let directory = cwd
  while (true) {
    if (hasUnoConfigIn(directory)) {
      return true
    }
    const parent = dirname(directory)
    if (parent === directory) {
      return false
    }
    directory = parent
  }
}
