import { normalizeValue } from "@owlmeans/regov-ssi-common"
import { BasicCredentialType } from "@owlmeans/regov-ssi-core"
import { Extension } from "./ext"


export const findAppropriateCredentialType = (
  ext: Extension, types: BasicCredentialType, defaultType: string
): string => {
  types = normalizeValue(types)

  return (Object.entries(ext.factories).map(([type]) => type)
    .find(type => types.includes(type)) || defaultType)
}