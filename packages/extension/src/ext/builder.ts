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


export const buildExtension = <
  CredType extends string,
  FlowType extends string | undefined = undefined
>(
  schema: ExtensionSchema<CredType, FlowType>,
  factories?: ExtensionFactories<CredType>
): Extension<CredType, FlowType> => {
  const _extension: Extension<CredType, FlowType> = {
    schema,
    factories: Object.entries(schema.credentials).reduce(
      (_factories, [key, description]) => {
        return {
          ..._factories,
          [key]: {
            buildingFactory: defaultBuildingFactory(description as CredentialDescription),
            ...(factories ? factories[key as CredType] as CredentialExtensionFactories : {})
          }
        }
      }, {} as ExtensionFactories<CredType>
    )
  }

  return _extension
}