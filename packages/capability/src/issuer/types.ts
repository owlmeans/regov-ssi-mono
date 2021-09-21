import { OfferCredential, OfferSubject, SatelliteCredential, SatelliteSubject } from '@owlmeans/regov-ssi-agent'
import { CredentialSubject, Credential, MaybeArray } from '@owlmeans/regov-ssi-core'
import { DIDDocument } from '@owlmeans/regov-ssi-did'
import { CapabilityCredential } from '../governance/types'


export type OfferCredentialByCapability<
  CredentialT extends Credential<MaybeArray<CredentialSubject>> = Credential<MaybeArray<CredentialSubject>>,
  Extension extends ByCapabilityExtension = ByCapabilityExtension
  >
  = OfferCredential<OfferSubject<CredentialT, Extension>>

export type ByCapabilityExtension = {
  capability: CapabilityCredential
  chain: DIDDocument[]
}

export const CAPABILITY_BYOFFER_TYPE = 'OfferByCapability'
export const ERROR_AMBIGOUS_CAPABILITY_TO_PATCH = 'ERROR_AMBIGOUS_CAPABILITY_TO_PATCH'