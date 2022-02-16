
export const REGOV_CREDENTIAL_TYPE_SIGNATURE = 'OwlMeans:Regov:Signature'

export const REGOV_CLAIM_TYPE_SIGNATURE = 'OwlMeans:Regov:Signature:Claim'
export const REGOV_OFFER_TYPE_SIGNATURE = 'OwlMeans:Regov:Signature:Offer'

export const BASIC_IDENTITY_TYPE = 'Identity'

export const REGOV_EXT_SIGNATURE_NAMESPACE = 'owlmeans-regov-ext-doc-signature'

export type RegovSignatureCredential = typeof REGOV_CREDENTIAL_TYPE_SIGNATURE

export type SignatureSubject = {
  name: string
  description: string
  documentHash: string
  docType: string
  filename?: string
  url?: string
  creationDate: string
  version?: string
  author: string
  authorId: string
  signedAt?: string
}

export const DOCUMENT_TYPE_JSON = 'JSON'
export const DOCUMENT_TYPE_TEXT = 'Text'
export const DOCUMENT_TYPE_BINARY = 'Binary'

export const ERROR_WIDGET_AUTHENTICATION = 'ERROR_WIDGET_AUTHENTICATION'