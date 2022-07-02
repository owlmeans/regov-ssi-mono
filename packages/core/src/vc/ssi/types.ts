/**
 *  Copyright 2022 OwlMeans
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

import { CryptoHelper } from "../../common"
import { KeyChainWrapper } from "../../keys/types"
import {
  LoadedDocument, BuildDocumentLoader, DIDDocument, DIDHelper, DIDRegistryWrapper, DIDDocumentUnsinged
} from '../../did'
import {
  Credential, CredentialContextType, CredentialType,
  Presentation, PresentationHolder, UnsignedCredential, UnsignedPresentation, ContextSchema,
  Validated,
  CredentialHolder,
} from "../types"


export type BuildSSICoreMethod = (options: {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  defaultSchema?: string
}) => Promise<SSICore>

export type SSICore = {
  keys: KeyChainWrapper
  crypto: CryptoHelper
  did: DIDRegistryWrapper
  buildContext: (url: string, extendedCtx?: ContextSchema, baseUrl?: string) => ContextSchema
  buildCredential: BuildCredentialMethod
  signCredential: SignCredentialMethod
  verifyCredential: VerfiyCredentailMethod
  buildPresentation: BuildPresentationMethod
  signPresentation: SignPresentationMethod
  verifyPresentation: VerifyPresentationMethod
  verifyEvidence: VerifyEvidenceMethod
  verifySchema: VerifySchemaMethod
}

export type VerifySchemaMethod = (
  credential: Credential,
  presentation?: Presentation,
  options?: LocalDocumentLoader | VerifySchemaOptions
) => Promise<[boolean, Error[]]>

export type VerifySchemaOptions = {
  localLoader?: LocalDocumentLoader
  nonStrictEvidence?: boolean
}

export type BuildCredentialMethod = <
  Subject extends {} = {},
  Unsigned extends UnsignedCredential<Subject> = UnsignedCredential<Subject>
  >(options: BuildCredentailOptions<Subject>) => Promise<Unsigned>

export type BuildCredentailOptions<
  Subject extends {} = {}
  > = {
    id: string,
    type: CredentialType
    holder: CredentialHolder,
    subject: Subject,
    issueanceDate?: string
    context: CredentialContextType
  }

export type SignCredentialMethod = <
  Subject extends {} = {},
  CredentialT extends Credential<Subject> = Credential<Subject>,
  CredentialU extends UnsignedCredential<Subject> = UnsignedCredential<Subject>
  >(
  unsingedCredential: CredentialU,
  issuer?: DIDDocument,
  options?: SignCredentialOptions
) =>
  Promise<CredentialT>

export type SignCredentialOptions = {
  buildProofPurposeOptions?: () => Promise<Object>
  keyId?: string
}

export type VerfiyCredentailMethod = (
  credential: Credential,
  did?: DIDDocument | string,
  keyId?: string | VerifyCredentialOptions
) => Promise<[boolean, VerificationResult]>

export type VerifyCredentialOptions = {
  keyId?: string
  localLoader?: LocalDocumentLoader
  verifyEvidence?: boolean
  verifySchema?: boolean
  nonStrictEvidence?: boolean
}

export type VerificationResult<CredentialT extends Credential = Credential>
  = Validated<CredentialT>

export type BuildPresentationMethod = <
  CredentialT extends Credential = Credential,
  >(
  credentials: CredentialT[],
  options: BuildPresentationOptions
) => Promise<UnsignedPresentation<CredentialT>>

export type BuildPresentationOptions = {
  id?: string
  type?: string | string[]
  context?: CredentialContextType
  holder: PresentationHolder
}

export type SignPresentationMethod = <CredentialT extends Credential = Credential, >(
  unsignedPresentation: UnsignedPresentation<CredentialT>,
  holder: DIDDocument,
  options?: SignPresentationOptions
) => Promise<Presentation<CredentialT>>

export type SignPresentationOptions = {
  buildProofPurposeOptions?: () => Promise<Object>
  challenge?: string
  domain?: string
  keyId?: string
}

export type VerifyPresentationMethod = (
  presentation: Presentation,
  didDoc?: DIDDocument,
  options?: LocalDocumentLoader | VerifyPresentationOptions
) => Promise<[boolean, VerifyPresentationResult]>

export type VerifyPresentationOptions = {
  localLoader?: LocalDocumentLoader
  testEvidence?: boolean
  nonStrictEvidence?: boolean
}

export type VerifyEvidenceMethod = (
  credential: Credential,
  presentation?: Presentation,
  options?: LocalDocumentLoader | VerifyEvidenceOptions
) => Promise<[boolean, Error[]]>

export type VerifyEvidenceOptions = {
  localLoader?: LocalDocumentLoader
  nonStrictEvidence?: boolean
}

export type LocalDocumentLoader = (
  didHelper: DIDHelper,
  loaderBuilder: BuildDocumentLoader<Credential>,
  presentation: Presentation,
  didDoc?: DIDDocument
) => (url: string) => Promise<LoadedDocument<Credential>>

export type VerifyPresentationResult<PresentationT extends Presentation = Presentation>
  = Validated<PresentationT>

export const ERROR_NO_PRESENTATION_SIGNING_KEY = 'ERROR_NO_PRESENTATION_SIGNING_KEY'
export const ERROR_NO_CREDENTIAL_SIGNING_KEY = 'ERROR_NO_CREDENTIAL_SIGNING_KEY'