import {
  CredentialDescription, CredentialSchema, MaybeArray, Presentation, Credential
} from "@owlmeans/regov-ssi-core"
import { ExpandedTermDefinition } from "jsonld"


export type CustomDescription<
  Subject extends {} = {},
  Schema extends CredentialSchema = CredentialSchema,
> = CredentialDescription<Subject, Schema> & {
  subjectMeta: SubjectMeta<Subject>
  ns: string
  typeAlias?: string
  customExtFlag: true
}

export const isCustom = <Subject extends {} = {}>(
  cred: CredentialDescription<Subject>
): cred is CustomDescription<Subject> => (cred as CustomDescription).customExtFlag

export type DefaultSubject = Record<string, any>

export type DefaultCredential = Credential<DefaultSubject>

export type DefaultPresentation = Presentation<DefaultCredential>

export type SubjectMeta<Subject extends {}> = {
  [k in keyof Subject]: SubjectFieldMeta
}

export type SubjectFieldMeta = {
  useAt: MaybeArray<UseFieldAt>
  term?: ExpandedTermDefinition
  validation?: ValidationOptions
}

export type ValidationOptions = Partial<{
  required: boolean
  minLength: number
  maxLength: number
  pattern: RegExp
}>


export const USE_CREATE_CLAIM = "claim_create"
export const USE_PREVIEW_CLAIM = "claim_preview"

export const enum UseFieldAt {
  CLAIM_CREATE = "claim_create",
  CLAIM_PREVIEW = "claim_preview"
}

export const DEFAULT_SUFFIX_CLAIM = "Claim"
export const DEFAULT_SUFFIX_OFFER = "Offer"
export const DEFAULT_SUFFIX_REQUEST = "Request"
export const DEFAULT_SUFFIX_RESPONSE = "Response"