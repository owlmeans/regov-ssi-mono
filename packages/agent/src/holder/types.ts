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

export type ResponseBundle<CredentialT extends Credential> = {
  presentation: Presentation<CredentialT | SatelliteCredential>,
  did: DIDDocument
}

export type HolderVisitorBuilder<
  CredentialT extends Credential = Credential,
  Extension extends {} = {},
  Offer extends OfferCredential<OfferSubject<CredentialT, Extension>>
  = OfferCredential<OfferSubject<CredentialT, Extension>>
  > = (wallet: WalletWrapper) => HolderVisitor<CredentialT, Extension, Offer>

export type HolderVisitor<
  CredentialT extends Credential = Credential,
  Extension extends {} = {},
  Offer extends OfferCredential<OfferSubject<CredentialT, Extension>>
  = OfferCredential<OfferSubject<CredentialT, Extension>>
  > = {
    bundle?: {
      store?: {
        storeOffer?: (offer: Offer) => Promise<void>
      },

      unbundle?: {
        updateIssuer?: (
          offer: OfferBundle<Offer>,
          holder: string
        ) => Promise<CredentialWrapper<CredentialSubject> | undefined>

        updateDid?: (
          offer: OfferBundle<Offer>,
          holder: string
        ) => Promise<DIDDocument | undefined>

        verifyHolder?: (offer: OfferBundle<Offer>, did: DIDDocument) => Promise<boolean>
      }

      response?: {
        build?: {
          createCapability?: (
            unsignedSatellite: UnsignedCredential<SatelliteSubject<Extension>>,
            credential: CredentialT
          ) => Promise<void>
        }
      }
    }
  }

export const ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL = 'ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL'

export const ERROR_UNTRUSTED_ISSUER = 'ERROR_UNTRUSTED_ISSUER'
export const ERROR_NO_RELATED_DID_FOUND = 'ERROR_NO_RELATED_DID_FOUND'
export const ERROR_CLAIM_OFFER_DONT_MATCH = 'ERROR_CLAIM_OFFER_DONT_MATCH'

export const ERROR_WRONG_CLAIM_SUBJECT_TYPE = 'ERROR_WRONG_CLAIM_SUBJECT_TYPE'

export const CLAIM_TYPE_PREFFIX = 'Claim'

export const CREDENTIAL_RESPONSE_TYPE = 'CredentialResponse'

export const CREDENTIAL_SATELLITE_TYPE = 'CredentialSatellit'
