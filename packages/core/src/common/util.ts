/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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