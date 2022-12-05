import { Presentation, Credential, normalizeValue, MaybeArray, isPresentation } from "@owlmeans/regov-ssi-core"
import { CustomDescription } from "../../custom.types"


export const getCredential = (
  descr: CustomDescription, presentation: Presentation
): Credential | undefined =>
  normalizeValue(presentation.verifiableCredential).find(cred => cred.type.includes(descr.mainType))

export const getSubject = <Subject extends MaybeArray<{}> = MaybeArray<{}>>(
  descr: CustomDescription, cred: Credential | Presentation
): Subject =>
  isPresentation(cred)
    ? (
      cred && getCredential(descr, cred)
        ? getSubject(descr, getCredential(descr, cred) as Credential)
        : undefined
    ) as Subject
    : cred.credentialSubject as Subject