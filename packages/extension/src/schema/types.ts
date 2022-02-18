import { MaybeArray } from "@owlmeans/regov-ssi-common"
import {
  BasicCredentialType,
  CredentialSchema,
  MultiSchema,
  WalletWrapper,
  CredentialSubject,
  Credential,
  Presentation
} from "@owlmeans/regov-ssi-core"
import { Extension } from "../ext"


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
  Schema extends CredentialSchema = CredentialSchema,
  Subject extends CredentialSubject = CredentialSubject
  > = {
    defaultNameKey?: string
    mainType: string
    mandatoryTypes?: BasicCredentialType
    credentialContext: MultiSchema
    contextUrl?: string
    evidence?: MaybeArray<CredentialEvidenceDesctiption>
    credentialSchema?: MaybeArray<Schema>
    registryType?: string
    claimable?: boolean
    listed?: boolean
    selfIssuing?: boolean
    trustable?: boolean
    claimType?: string
    requestType?: string
    defaultSubject?: Subject
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
export const EXTENSION_TRIGGER_DEFAULT_SIGNATURE = 'signer:default-signature'
export const EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED = 'documnet:received'
export const EXTENSION_TRIGGER_RETRIEVE_NAME = 'credentail:get-name'

export type IncommigDocumentEventParams = EventParams & {
  credential: Credential | Presentation
  statusHandler: {
    successful: boolean
  }
  cleanUp: () => void
}

export type RetreiveNameEventParams = EventParams & {
  credential: Credential
  setName: (name: string) => void
}