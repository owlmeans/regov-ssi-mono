import { BASE_CREDENTIAL_TYPE } from "@owlmeans/regov-ssi-core"
import { CredentialExtensionFactories, Extension, ExtensionFactories, ExtensionFactoriesParam  } from "./types"
import { ExtensionSchema } from "../schema"
import { findAppropriateCredentialType } from "../util"
import { 
  defaultBuildingFactory, defaultClaimingFactory, defaultSigningFactory, defaultValidationFactory ,
  defaultOfferingFactory, defaultRequestFactory
} from "./factory"
import { singleValue } from "@owlmeans/regov-ssi-common"
import { defaultResponseFactory } from "./factory/response"


export const buildExtension = (
  schema: ExtensionSchema,
  factories?: ExtensionFactoriesParam
): Extension => {
  const _extension: Extension = {
    schema,
    factories: schema.credentials ? Object.entries(schema.credentials).reduce(
      (_factories, [key, description]) => {
        return {
          ..._factories,
          [key]: {
            buildingFactory: defaultBuildingFactory(description),
            signingFactory: defaultSigningFactory(description),
            validationFactory: defaultValidationFactory(description),
            claimingFactory: defaultClaimingFactory(description),
            offeringFactory: defaultOfferingFactory(description),
            requestFactory: defaultRequestFactory(description),
            responseFactory: defaultResponseFactory(description),
            ...(factories
              ? Object.entries(factories[key]).reduce((_facts, [method, builder]) => {
                if (schema.credentials) {
                  return {
                    ..._facts,
                    [method]: builder(schema.credentials[key])
                  }
                }
                return _facts
              }, {} as CredentialExtensionFactories)
              : {}
            )
          }
        }
      }, {} as ExtensionFactories
    ) : {} as ExtensionFactories,

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