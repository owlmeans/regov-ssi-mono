import { MaybeArray, Idish } from "./types"

export const normalizeValue = <Type>(value: MaybeArray<Type>): Type[] => {
  return Array.isArray(value)
    ? value
    : value ? [value] : []
}

export const simplifyValue = <Type>(value: MaybeArray<Type>) => {
  return Array.isArray(value) && value.length < 2
    ? value.length === 0 ? undefined : value[0]
    : value
}

export const singleValue = <Type>(value: MaybeArray<Type>): Type | undefined => {
  return Array.isArray(value)
    ? value.length > 0 ? value[0] : undefined
    : value
}

export const mapValue = async <Type, Res>(
  value: MaybeArray<Type>,
  callback: (value: Type) => Promise<Res>
): Promise<Res[]> => {
  return Promise.all(normalizeValue(value).map(callback))
}

export const addToValue = <Type>(value: MaybeArray<Type> | undefined, add: MaybeArray<Type>): MaybeArray<Type> => {
  if (value) {
    return [...normalizeValue(value), ...normalizeValue(add)]
  }

  return add
}

export const extractId = (id: Idish) => typeof id === 'string' ? id : id.id

export const getDeepValue = <Type, Subject extends {}>(subject: Subject, key: string, def?: Type): Type => {
  const parts = key.split('.')
  return parts.reduce((value, key) => {
    if (subject.hasOwnProperty(key)) {
      const tmp = (subject as any)[key]
      subject = tmp

      return tmp
    }

    return def
  }, def) as Type
}