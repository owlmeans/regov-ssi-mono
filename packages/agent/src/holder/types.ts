import { DIDDocument, DIDDocumentUnsinged } from "@owlmeans/regov-ssi-did"
import {
  CredentialSubject,
  WrappedDocument,
  UnsignedCredential,
  Credential,
  Presentation,
  MaybeArray,
  WalletWrapper,
  CredentialType,
  CredentialWrapper
} from "@owlmeans/regov-ssi-core"
import { OfferBundle, OfferCredential, OfferSubject } from "../issuer/types"


export type ClaimSubject<
  CredentialUT extends UnsignedCredential<MaybeArray<CredentialSubject>>
  = UnsignedCredential<MaybeArray<CredentialSubject>>,
  Extension extends {} = {}
  > = CredentialSubject<ClaimDocument<CredentialUT>, ClaimSubjectExtension<Extension>>

export type ClaimDocument<CredentialUT extends UnsignedCredential<MaybeArray<CredentialSubject>>
  = UnsignedCredential<MaybeArray<CredentialSubject>>>
  = WrappedDocument<{ credential: CredentialUT }>

export type ClaimSubjectExtension<Extension extends {} = {}> = { did: DIDDocumentUnsinged } & Extension

export const CREDENTIAL_CLAIM_TYPE = 'CredentialClaim'

export type ClaimCredential<Subject extends ClaimSubject = ClaimSubject>
  = Credential<Subject>

export type UnsignedClaimCredential<Subject extends ClaimSubject = ClaimSubject>
  = UnsignedCredential<Subject>

export type ClaimBundle<BundledClaim extends ClaimCredential>
  = Presentation<BundledClaim>

export type ClaimPayload<Claim> = Claim extends ClaimCredential<infer ClaimSubjectT>
  ? ClaimSubjectT extends ClaimSubject<infer CredentialUT>
  ? CredentialUT extends UnsignedCredential<infer Subject>
  ? Subject extends CredentialSubject<infer SourceType, any>
  ? SourceType extends WrappedDocument<infer Payload> ? Payload : never
  : never
  : never
  : never
  : never

export type ClaimExtenstion<Claim> = Claim extends ClaimCredential<infer ClaimSubjectT>
  ? ClaimSubjectT extends ClaimSubject<infer CredentialUT>
  ? CredentialUT extends UnsignedCredential<infer Subject>
  ? Subject extends CredentialSubject<any, infer Extension>
  ? Extension
  : never
  : never
  : never
  : never

export type SatelliteSubject<DocExtension extends {} = {}>
  = CredentialSubject<SetelliteSubjectType<DocExtension>, {}>

export type SetelliteSubjectType<DocExtension extends {} = {}>
  = WrappedDocument<{ did: DIDDocument } & DocExtension>

export type SatelliteCredential<Subject extends SatelliteSubject = SatelliteSubject>
  = Credential<Subject>

export type UnsisgnedSatellite<Subject extends SatelliteSubject = SatelliteSubject>
  = UnsignedCredential<Subject>

export const ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL = 'ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL'

export const ERROR_UNTRUSTED_ISSUER = 'ERROR_UNTRUSTED_ISSUER'
export const ERROR_NO_RELATED_DID_FOUND = 'ERROR_NO_RELATED_DID_FOUND'
export const ERROR_CLAIM_OFFER_DONT_MATCH = 'ERROR_CLAIM_OFFER_DONT_MATCH'

export const ERROR_PRESENTATION_VERIFICTION = 'ERROR_PRESENTATION_VERIFICTION'
export const ERROR_PRESENTATION_SHOULBE_OFFER = 'ERROR_PRESENTATION_SHOULBE_OFFER'
export const ERROR_UNBUNDLE_NOCLAIM_TOMATCH = 'ERROR_UNBUNDLE_NOCLAIM_TOMATCH'

export const ERROR_WRONG_CLAIM_SUBJECT_TYPE = 'ERROR_WRONG_CLAIM_SUBJECT_TYPE'

export const CLAIM_TYPE_PREFIX = 'Claim'

export const CREDENTIAL_RESPONSE_TYPE = 'CredentialResponse'

export const CREDENTIAL_SATELLITE_TYPE = 'CredentialSatellit'
