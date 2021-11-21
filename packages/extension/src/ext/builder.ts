import { ExtensionSchema } from "../schema";
import { Extension, ExtensionFactories } from "./types";


export const buildExtension = <
  CredType extends string,
  FlowType extends string | undefined = undefined
>(
  schema: ExtensionSchema<CredType, FlowType>,
  factories: ExtensionFactories = {}
): Extension<CredType, FlowType> => {
  const _extension: Extension<CredType, FlowType> = {
    schema,
    ...factories
  }

  return _extension
}