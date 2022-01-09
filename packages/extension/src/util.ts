import { normalizeValue } from "@owlmeans/regov-ssi-common"
import { BasicCredentialType } from "@owlmeans/regov-ssi-core"
import { Extension } from "./ext"


export const findAppropriateCredentialType = <CredType extends string>(
  ext: Extension<CredType>, types: BasicCredentialType, defaultType: string
): CredType => {
  types = normalizeValue(types)
  
  return (Object.entries(ext.factories).map(([type]) => type)
    .find(type => types.includes(type)) || defaultType) as CredType
}