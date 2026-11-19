type RawParams = Record<string, string | string[] | undefined>

export function param(params: RawParams, key: string): string | undefined {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

export function oneOf<T extends string>(value: string | undefined, options: readonly T[]): T | undefined {
  return options.includes(value as T) ? (value as T) : undefined
}

export function positiveInt(value: string | undefined): number | undefined {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : undefined
}
