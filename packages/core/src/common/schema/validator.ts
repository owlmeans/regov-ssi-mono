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