export function omit<T extends object, K extends keyof T>(object: T, keys: readonly K[]): Omit<T, K> {
  const result = { ...object }
  for (const key of keys) {
    delete result[key]
  }
  return result
}
