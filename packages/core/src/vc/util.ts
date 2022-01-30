
import { MaybeArray } from "@owlmeans/regov-ssi-common"
import { 
  CredentialSchema, 
  FullCredentialSchema, 
  FullCrednetialEvidnce, 
  UnsignedCredential 
} from "./types"
import {
  Presentation,
  Credential,
  Evidence
} from "./types"


export const isPresentation = (obj: Object): obj is Presentation => {
  return obj.hasOwnProperty('verifiableCredential')
}

export const isCredential = (obj: Object): obj is Credential => {
  return obj.hasOwnProperty('credentialSubject')
}

export const extractSubject = <
  CredentialT extends UnsignedCredential = Credential
>(cred: CredentialT, idx?: number) => {
  type SubjectT = CredentialT extends UnsignedCredential<infer T>
    ? T extends Array<infer ST>
    ? ST : T
    : never

  const subject = Array.isArray(cred.credentialSubject)
    ? cred.credentialSubject[idx || 0]
    : cred.credentialSubject

  return subject as SubjectT
}

export const isFullEvidence = (obj: Evidence): obj is FullCrednetialEvidnce => {
  return obj.hasOwnProperty('credentialSubject')
}

export const isFullCredentialSchema = (obj: CredentialSchema): obj is FullCredentialSchema => {
  return obj.hasOwnProperty('credentialSubject')
}

export const getCompatibleSubject = <Type extends MaybeArray<{}>>(cred: UnsignedCredential): Type  => {
  return cred.credentialSubject as unknown as Type
}