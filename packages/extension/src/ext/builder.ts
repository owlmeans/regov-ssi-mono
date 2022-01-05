import { CredentialExtensionFactories } from ".";
import {
  CredentialDescription,
  ExtensionSchema
} from "../schema";
import { defaultBuildingFactory } from "./factory"
import {
  Extension,
  ExtensionFactories
} from "./types";


export const buildExtension = <CredType extends string>(
  schema: ExtensionSchema<CredType>,
  factories?: ExtensionFactories<CredType>
): Extension<CredType> => {
  const _extension: Extension<CredType> = {
    schema,
    factories: schema.credentials ? Object.entries(schema.credentials).reduce(
      (_factories, [key, description]) => {
        return {
          ..._factories,
          [key]: {
            buildingFactory: defaultBuildingFactory(description as CredentialDescription),
            ...(factories ? factories[key as CredType] as CredentialExtensionFactories : {})
          }
        }
      }, {} as ExtensionFactories<CredType>
    ) : {} as ExtensionFactories<CredType>,

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