/**
 *  Copyright 2023 OwlMeans
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

import { BASE_CREDENTIAL_TYPE } from "../../vc"
import {
  CredentialService, Extension, ExtensionService, ExtensionServiceBuilder
} from "./types"
import { ExtensionSchema } from "../schema"
import { findAppropriateCredentialType } from "../util"
import {
  defaultBuildMethod, defaultClaimMethod, defaultSignMethod, defaultValidateMethod,
  defaultOfferMethod, defaultRequestMethod, defaultRefuseMethod
} from "./factory"
import { singleValue } from "../../common"
import { defaultRespondMethod } from "./factory/response"

const methodMap = {
  'produceBuildMethod': 'build',
  'produceSignMethod': 'sign',
  'produceValidateMethod': 'validate',
  'produceClaimMethod': 'claim',
  'produceOfferMethod': 'offer',
  'produceRefuseMethod': 'refuse',
  'produceRequestMethod': 'request',
  'produceRespondMethod': 'respond'
}

export const buildExtension = (
  schema: ExtensionSchema,
  factories?: ExtensionServiceBuilder
): Extension => {
  const _extension: Extension = {
    schema,
    factories: schema.credentials ? Object.entries(schema.credentials).reduce(
      (_factories, [key, description]) => {
        return {
          ..._factories,
          [key]: {
            build: defaultBuildMethod(description),
            sign: defaultSignMethod(description),
            validate: defaultValidateMethod(description),
            claim: defaultClaimMethod(description),
            offer: defaultOfferMethod(description),
            refuse: defaultRefuseMethod(description),
            request: defaultRequestMethod(description),
            respond: defaultRespondMethod(description),
            ...(
              factories && factories[key]
                ? Object.entries(factories[key]).reduce((_facts, [method, builder]) => {
                  if (schema.credentials) {
                    return {
                      ..._facts,
                      [(methodMap as any)[method]]: builder(schema.credentials[key])
                    }
                  }
                  return _facts
                }, {} as CredentialService)
                : {}
            )
          }
        }
      }, {} as ExtensionService
    ) : {} as ExtensionService,

    getFactory: (type, defaultType = BASE_CREDENTIAL_TYPE) => {
      type = findAppropriateCredentialType(_extension, type, defaultType)

      return _extension.factories[type]
    },

    getEvents: (trigger, code) => {
      if (!_extension.schema.events) {
        return []
      }

      return _extension.schema.events.filter(event =>
        event.trigger === trigger && (!code || event.code === code)
      )
    },

    getEvent: (trigger, code) => {
      return singleValue(_extension.getEvents(trigger, code))
    },

    modifyEvent: (trigger, param, value, code) => {
      const event = _extension.getEvent(trigger, code)
      if (event) {
        event[param] = value as any
      }
    }
  }

  return _extension
}