/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


import { MaybeArray } from "../common"
import { CredentialSchema, FullCredentialSchema, FullCrednetialEvidnce, UnsignedCredential } from "./types"
import { Presentation, Credential, Evidence } from "./types"


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

export const getCompatibleSubject = <Type extends MaybeArray<{}>>(cred: UnsignedCredential): Type => {
  return cred.credentialSubject as unknown as Type
}