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

import { normalizeValue } from "../common"
import { BasicCredentialType, Credential } from "../vc"
import { defaultBuildMethod } from "./ext/factory/building"
import { defaultClaimMethod } from "./ext/factory/claiming"
import { defaultOfferMethod } from "./ext/factory/offering"
import { defaultRequestMethod } from "./ext/factory/request"
import { defaultRespondMethod } from "./ext/factory/response"
import { defaultSignMethod } from "./ext/factory/signing"
import { defaultValidateMethod } from "./ext/factory/validation"
import { CredentialService, CredentialServiceBuilder, Extension, ValidationResult } from "./ext/types"
import { CredentialDescription } from "./schema"


export const findAppropriateCredentialType = (
  ext: Extension, types: BasicCredentialType, defaultType: string
): string => {
  types = normalizeValue(types)

  return (Object.entries(ext.factories).map(([type]) => type)
    .find(type => types.includes(type)) || defaultType)
}

const methodMap = {
  'produceBuildMethod': 'build',
  'produceSignMethod': 'sign',
  'produceValidateMethod': 'validate',
  'produceClaimMethod': 'claim',
  'produceOfferMethod': 'offer',
  'produceRequestMethod': 'request',
  'produceRespondMethod': 'respond'
}

export const addFactoriesToExt = (ext: Extension, type: string, factories: CredentialServiceBuilder) => {
  const description = (ext.schema.credentials as { [key: string]: CredentialDescription })[type]
  ext.factories[type] = {
    ...{
      build: defaultBuildMethod(description),
      sign: defaultSignMethod(description),
      validate: defaultValidateMethod(description),
      claim: defaultClaimMethod(description),
      offer: defaultOfferMethod(description),
      request: defaultRequestMethod(description),
      respond: defaultRespondMethod(description)
    },
    ...Object.entries(factories).reduce((_facts, [method, builder]) => {
      if (ext.schema.credentials) {
        return {
          ..._facts,
          [(methodMap as any)[method]]: builder(description)
        }
      }
      return _facts
    }, {} as CredentialService)
  }
}

interface CredentialChainDebug {
  id: string
  type: string[]
  children: CredentialChainDebug[]
}

export const debugCredentialChain = (credential: Credential): CredentialChainDebug => {
  const result: CredentialChainDebug = { id: credential.id, type: credential.type, children: [] }

  result.children = normalizeValue(credential.evidence).map(
    evidence => debugCredentialChain(evidence as Credential)
  )

  return result
}

export const debugValidationResult = (result: ValidationResult): CredentialChainDebug => {
  const _result: CredentialChainDebug = {
    id: result.instance?.id || '',
    type: result.instance?.type || [''],
    children: []
  }

  _result.children = normalizeValue(result.evidence).map(
    evidence => debugValidationResult(evidence.result)
  )

  return _result
}