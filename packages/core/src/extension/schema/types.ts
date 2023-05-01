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

import { MaybeArray } from "../../common"
import { BasicCredentialType, CredentialSchema, MultiSchema, Credential, Presentation, UnsignedCredential } from "../../vc"
import { CredentialWrapper, WalletWrapper } from '../../wallet'
import { Extension } from "../ext"
import { ExtensionRegistry } from "../registry"


export type ExtensionSchema = {
  details: ExtensionDetails
  credentials?: { [key: string]: CredentialDescription }
  events?: ExtensionEvent[]
}

export type ExtensionDetails = {
  name: string
  code: string
  defaultCredType?: string
  types?: ExtensionTypes
  organization?: string
  home?: string
  schemaBaseUrl?: string
}

export type ExtensionTypes = {
  claim?: string
  offer?: string
}

export type CredentialDescription<
  Subject extends {} = {},
  Schema extends CredentialSchema = CredentialSchema
> = {
  defaultNameKey?: string
  mainType: string
  mandatoryTypes?: BasicCredentialType
  credentialContext: MultiSchema
  contextUrl?: string
  evidence?: MaybeArray<CredentialEvidenceDesctiption>
  credentialSchema?: MaybeArray<Schema>
  registryType?: string
  claimType?: string
  offerType?: string
  refuseType?: string
  requestType?: string
  responseType?: string
  defaultSubject?: Subject
  arbitraryEvidence?: boolean
  verfiableId?: CredentialIdMeta
  sourceType?: string
  metaRole?: MetaRole
}

export type MetaRole = typeof META_ROLE_CREDENTIAL
  | typeof META_ROLE_CLAIM
  | typeof META_ROLE_OFFER
  | typeof META_ROLE_REQUEST
  | typeof META_ROLE_RESPONSE

export const META_ROLE_CREDENTIAL = 'credential'
export const META_ROLE_CLAIM = 'claim'
export const META_ROLE_OFFER = 'offer'
export const META_ROLE_REQUEST = 'request'
export const META_ROLE_RESPONSE = 'response'

export type CredentialIdMeta = {
  fields: string[]
}

export type CredentialEvidenceDesctiption = {
  type: string
  signing?: boolean
  schema?: MaybeArray<CredentialSchema>
}

export type ExtensionEvent = {
  trigger: MaybeArray<string>
  code?: string
  filter?: ExtensionEventFilter
  method?: EventObserverMethod
}

export type EventObserverMethod = (
  wallet: WalletWrapper,
  params: EventParams
) => Promise<boolean | undefined | void>

export type EventParams = { ext?: Extension }

export type ExtensionEventFilter =
  (wallet: WalletWrapper, params: EventParams) => Promise<boolean>

export const EXTENSION_TRIGGER_AUTHENTICATION = 'wallet:authentication'
export const EXTENSION_TRIGGER_AUTHENTICATED = 'wallet:authenticated'
export const EXTENSION_TRIGGER_UNAUTHENTICATED = 'wallet:unauthenticated'
export const EXTENSION_TRIGGER_INIT_SENSETIVE = 'wallet:init-sensetive'
export const EXTENSION_TRIGGER_ADD_CREDENTIAL = 'wallet:add-credential'
export const EXTENSION_TRIGGER_REMOVE_CREDENTIAL = 'wallet:remove-credential'
export const EXTENSION_TRIGGER_DEFAULT_SIGNATURE = 'signer:default-signature'
export const EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED = 'documnet:received'
export const EXTENSION_TRIGGER_RETRIEVE_NAME = 'credentail:get-name'
export const EXTENSION_TRIGGER_PRODUCE_IDENTITY = 'identity:produce'

export type CredentialEventParams = EventParams & {
  item: CredentialWrapper
}

export type IncommigDocumentEventParams = EventParams & {
  credential: Credential | Presentation | UnsignedCredential
  statusHandler: {
    successful: boolean
  }
  cleanUp: () => void
}

export type RetreiveNameEventParams = EventParams & {
  credential: Credential
  setName: (name: string) => void
}

export type InitSensetiveEventParams = EventParams & {
  extensions: ExtensionRegistry
}