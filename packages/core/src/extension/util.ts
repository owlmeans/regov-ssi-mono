import { normalizeValue } from "../common"
import { BasicCredentialType } from "../vc"
import { Extension } from "./ext"


export const findAppropriateCredentialType = (
  ext: Extension, types: BasicCredentialType, defaultType: string
): string => {
  types = normalizeValue(types)

  return (Object.entries(ext.factories).map(([type]) => type)
    .find(type => types.includes(type)) || defaultType)
}