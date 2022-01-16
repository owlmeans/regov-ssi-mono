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


export type ExtensionSchema<CredType extends string> = {
  details: ExtensionDetails
  credentials?: { [key in CredType]: CredentialDescription }
  events?: ExtensionEvent<CredType>[]
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
    evidence?: CredentialEvidenceDesctiption | CredentialEvidenceDesctiption[]
    credentialSchema?: Schema | Schema[]
    registryType?: string
    claimable?: boolean
    listed?: boolean
    selfIssuing?: boolean
    defaultSubject?: Subject
  }

export type CredentialEvidenceDesctiption = {
  type: BasicCredentialType,
  schema?: CredentialSchema | CredentialSchema[]
}

export type ExtensionEvent<CredType extends string> = {
  trigger: MaybeArray<string>
  code?: string
  filter?: ExtensionEventFilter<CredType>
  method?: EventObserverMethod<CredType>
}

export type EventObserverMethod<CredType extends string> = (
  wallet: WalletWrapper,
  params: EventParams<CredType>
) => Promise<boolean | undefined | void>

export type EventParams<CredType extends string> = {
  ext?: Extension<CredType>
}

export type ExtensionEventFilter<CredType extends string> =
  (wallet: WalletWrapper, params: EventParams<CredType>) => Promise<boolean>

export const EXTESNION_TRIGGER_AUTHENTICATION = 'wallet:authentication'
export const EXTESNION_TRIGGER_AUTHENTICATED = 'wallet:authenticated'
export const EXTESNION_TRIGGER_DEFAULT_SIGNATURE = 'signer:default-signature'
export const EXTESNION_TRIGGER_INCOMMING_DOC_RECEIVED = 'documnet:received'

export type IncommigDocumentEventParams<CredType extends string> =  EventParams<CredType> & {
  credential: Credential | Presentation,
  statusHandler: {
    successful: boolean
  }
}