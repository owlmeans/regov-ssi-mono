import { CredentialDescription, CredentialSchema, MaybeArray } from "@owlmeans/regov-ssi-core"
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

export type SubjectMeta<Subject extends {}> = {
  [k in keyof Subject]: {
    useAt: MaybeArray<UseFieldAt>
    term?: ExpandedTermDefinition
    validation?: ValidationOptions
  }
}

export type ValidationOptions = Partial<{
  required: boolean
  minLength: number
  maxLength: number
  pattern: RegExp
}>


export const USE_CREATE_CLAIM = "claim_create"

export const enum UseFieldAt {
  VIEW = "view",
  UPDATE = "update",
  CLAIM_CREATE = "claim_create",
  OFFER = "offer",
  LIST = "list",
  EVIDENCE = "evidence",
  VALIDATAION = "validation"
}

export const DEFAULT_SUFFIX_CLAIM = "Claim"
export const DEFAULT_SUFFIX_OFFER = "Offer"
export const DEFAULT_SUFFIX_REQUEST = "Request"
export const DEFAULT_SUFFIX_RESPONSE = "Response"