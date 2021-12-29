import { CredentialType } from "@owlmeans/regov-ssi-core"
import { Extension } from "./ext"


export const findAppropriateCredentialType = <CredType extends string>(
  ext: Extension<CredType>, types: CredentialType, defaultType: string
): CredType => {
  return (Object.entries(ext.factories).map(([type]) => type)
    .find(type => types.includes(type)) || defaultType) as CredType
}