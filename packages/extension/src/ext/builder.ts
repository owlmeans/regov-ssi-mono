import { BASE_CREDENTIAL_TYPE, BasicCredentialType } from "@owlmeans/regov-ssi-core";
import { CredentialExtensionFactories } from ".";
import {
  CredentialDescription,
  ExtensionSchema
} from "../schema";
import { findAppropriateCredentialType } from "../util";
import { defaultBuildingFactory, defaultClaimingFactory, defaultSigningFactory, defaultValidationFactory } from "./factory"
import {
  Extension,
  ExtensionFactories,
  ExtensionFactoriesParam
} from "./types";


export const buildExtension = <CredType extends string>(
  schema: ExtensionSchema<CredType>,
  factories?: ExtensionFactoriesParam<CredType>
): Extension<CredType> => {
  const _extension: Extension<CredType> = {
    schema,
    factories: schema.credentials ? Object.entries(schema.credentials).reduce(
      (_factories, [key, description]) => {
        return {
          ..._factories,
          [key]: {
            buildingFactory: defaultBuildingFactory(description as CredentialDescription),
            signingFactory: defaultSigningFactory(description as CredentialDescription),
            validationFactory: defaultValidationFactory(description as CredentialDescription),
            claimingFactory: defaultClaimingFactory(description as CredentialDescription),
            ...(factories
              ? Object.entries(factories[key as CredType]).reduce((_facts, [method, builder]) => {
                if (schema.credentials) {
                  return {
                    ..._facts,
                    [method]: builder(schema.credentials[key as CredType])
                  }
                }
                return _facts
              }, {} as CredentialExtensionFactories)
              : {}
            )
          }
        }
      }, {} as ExtensionFactories<CredType>
    ) : {} as ExtensionFactories<CredType>,

    getFactory: (type, defaultType = BASE_CREDENTIAL_TYPE) => {
      type = findAppropriateCredentialType(_extension, type, defaultType)

      return _extension.factories[type as CredType]
    },

    getEvents: (trigger, code) => {
      if (!_extension.schema.events) {
        return []
      }

      return _extension.schema.events.filter(event =>
        event.trigger === trigger && (!code || event.code === code)
      )
    }
  }

  return _extension
}