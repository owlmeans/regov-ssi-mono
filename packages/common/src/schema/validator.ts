
import Ajv from "ajv"
import { SomeJSONSchema } from "ajv/dist/types/json-schema"
import { MaybeArray } from "../types"


export const defaultValidationEngine = new Ajv()

export const validateSchema = <Type extends {}>(data: Type, schema: SomeJSONSchema, engine?: Ajv) => {
  engine = engine || defaultValidationEngine
  const validator = engine.compile<Type>(schema)
  if (validator(data)) {
    return [true, []]
  } else {
    return [false, validator.errors]
  }
}

export const CREDENTIAL_SCHEMA_TYPE_2020 = 'JsonSchema2020'

export const convertToSchema = <Type>(obj: MaybeArray<Type>): SomeJSONSchema => {
  return Array.isArray(obj) ? { anyOf: obj } : obj as any
} 