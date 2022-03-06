import { BASE_CREDENTIAL_TYPE } from "../../vc"
import { 
  CredentialService, CredentialServiceBuilder, Extension, ExtensionService, ExtensionServiceBuilder 
} from "./types"
import { ExtensionSchema } from "../schema"
import { findAppropriateCredentialType } from "../util"
import { 
  defaultBuildMethod, defaultClaimMethod, defaultSignMethod, defaultValidateMethod,
  defaultOfferMethod, defaultRequestMethod
} from "./factory"
import { singleValue } from "../../common"
import { defaultRespondMethod } from "./factory/response"

const methodMap = {
  'produceBuildMethod': 'build',
  'produceSignMethod': 'sign',
  'produceValidateMethod': 'validate',
  'produceClaimMethod': 'claim',
  'produceOfferMethod': 'offer',
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
            request: defaultRequestMethod(description),
            respond: defaultRespondMethod(description),
            ...(factories
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