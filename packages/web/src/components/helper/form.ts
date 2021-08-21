
import { MutableRefObject } from 'react'
import { InputProps } from '@material-ui/core'

export const buildFormHelper = <Type extends {}>(fields: MutableRefObject<InputProps>[]) => {
  const _fields = [...fields]
  const _registry: {[key: string]: MutableRefObject<InputProps> } = {}

  return {
    produce: (key: string) => {
      if (!_registry[key]) {
        _registry[key] = _fields.shift()
      }
      return {inputRef: _registry[key], id: key}
    },

    extract: <T extends {} = Type>(): T => fields.reduce(
      (values, field) => ({ ...values, [field.current.id]: field.current.value }), {}
    ) as T
  }
}