
export type DIDDocumnet = {
  '@context': string | DIDDocumentContext | DIDDocumentContext[]
  id: string,
  controller?: string,
  verificationMethod?: DIDVerificationMethod[]
  authenitcaion?: (string | DIDAuthentication)[]
  assertionMethod?: (string | DIDAssertion)[]
  keyAgreement?: (string | DIDKeyAgreement)[]
  capabilityInvocation?: (string | DIDCapability)[]
  capabilityDelegation?: (string | DIDDelegation)[]
  service?: DIDService[] 
}

export type DIDDocumentContext = {}

export type DIDVerificationItem = {
  id: string
  type: string
  controller: string
  publicKeyMultibase: string
}

export type DIDVerificationMethod = DIDVerificationItem & {}

export type DIDAuthentication = DIDVerificationItem & {}

export type DIDAssertion = DIDVerificationItem & {}

export type DIDKeyAgreement = DIDVerificationItem & {}

export type DIDCapability = DIDVerificationItem & {}

export type DIDDelegation = DIDVerificationItem & {}

export type DIDService = {
  id: string,
  type: string,
  serviceEndpoint: DIDServiceEndpoint
}

export type DIDServiceEndpoint = string | {[key: string]: string} | string[]