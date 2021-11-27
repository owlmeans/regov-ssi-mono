import {
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
  factories: ExtensionFactories = {}
): Extension<CredType, FlowType> => {
  const _extension: Extension<CredType, FlowType> = {
    schema,
    ...{
      buildingFactory: defaultBuildingFactory
    },
    ...factories
  }

  return _extension
}