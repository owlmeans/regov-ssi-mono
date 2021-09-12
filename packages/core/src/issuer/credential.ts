import {
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION,
  VERIFICATION_KEY_CONTROLLER
} from "@owlmeans/regov-ssi-did";
import { identityHelper } from "../wallet/identity";
import {
  CredentialSubject,
  Credential,
  CredentialSubjectType,
  BASE_CREDENTIAL_TYPE,
  UnsignedCredential,
  UnsignedPresentation,
  Presentation
} from "../credential/types";
import { WalletWrapper } from "../wallet/types";
import { KeyPair } from "../keys/types";
import { ContextObj, MaybeArray } from "@affinidi/vc-common";
import {
  ClaimSubject,
  ClaimCredential,
  CREDENTIAL_CLAIM_TYPE,
  ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL,
  ClaimBundle,
  ERROR_WRONG_CLAIM_SUBJECT_TYPE,
  CLAIM_TYPE_PREFFIX
} from "../holder/types";
import { CREDENTIAL_OFFER_TYPE, OfferBundle, OfferCredential, OfferSubject } from "./types";



export const issuerCredentialHelper = (wallet: WalletWrapper) => {
  const _identityHelper = identityHelper(wallet)


  return {
    claim: <
      Payload extends {} = {},
      Extension extends {} = {},
      CredentialT extends Credential<
        MaybeArray<CredentialSubject<CredentialSubjectType<Payload>, Extension>>
      > = Credential<
        MaybeArray<CredentialSubject<CredentialSubjectType<Payload>, Extension>>
      >
    >(issuer?: DIDDocument) => {
      type UnsignedClaim = ClaimCredential<
        ClaimSubject<
          UnsignedCredential<
            CredentialSubject<CredentialSubjectType<Payload>, Extension>
          >
        >
      >

      const _signClaim = async (
        claim: UnsignedClaim,
        key?: KeyPair | string
      ) => {
        issuer = issuer || _identityHelper.getIdentity().did?.did
        if (!issuer) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const signingKey = await wallet.keys.getCryptoKey(key)

        const did = await wallet.did.helper().signDID(signingKey, claim.credentialSubject.did)

        const credential = await wallet.ctx.signCredential(
          claim.credentialSubject.data.credential,
          issuer
        ) as CredentialT

        if (typeof claim.credentialSubject.data["@type"] !== 'string') {
          throw new Error(ERROR_WRONG_CLAIM_SUBJECT_TYPE)
        }

        const [prefix, type] = claim.credentialSubject.data["@type"].split(':', 2)

        if (!type && prefix !== CLAIM_TYPE_PREFFIX) {
          throw new Error(ERROR_WRONG_CLAIM_SUBJECT_TYPE)
        }

        const offerSubject: OfferSubject<CredentialT> = {
          data: {
            '@type': `Offer:${type}`,
            credential: credential,
          },
          did: did
        }

        const offerUnsigned = await wallet.ctx.buildCredential<
          CredentialSubjectType<{ credential: CredentialT }>,
          OfferSubject<CredentialT>
        >(
          {
            id: did.id,
            type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_OFFER_TYPE],
            holder: wallet.did.helper().extractProofController(issuer),
            subject: offerSubject,
            context: wallet.ctx.buildLDContext(
              'credential/claim',
              { did: { '@id': 'scm:did', '@type': '@json' } }
            )
          }
        )

        return await wallet.ctx.signCredential(
          offerUnsigned,
          issuer,
          { keyId: VERIFICATION_KEY_CONTROLLER }
        ) as OfferCredential<OfferSubject<CredentialT>>
      }

      return {
        signClaim: _signClaim,
        signClaims: async (claims: UnsignedClaim[], key?: KeyPair | string) => {
          return await Promise.all(
            claims.map(claim => _signClaim(claim, key))
          )
        }
      }
    },

    bundle: <
      BundledClaim extends ClaimCredential,
      BundledOffer extends OfferCredential = OfferCredential
    >(
      issuer?: DIDDocument
    ) => ({
      unbudle: async (bundle: ClaimBundle<BundledClaim>) => {
        let [result] = await wallet.ctx.verifyPresentation(
          bundle.presentation,
          bundle.did
        )

        if (!bundle.presentation.type.includes(CREDENTIAL_CLAIM_TYPE)) {
          result = false
        }

        return [
          result,
          bundle.presentation.verifiableCredential
        ] as [boolean, BundledClaim[]]
      },

      build: async (offers: BundledOffer[]) => {
        issuer = issuer || _identityHelper.getIdentity().did?.did
        if (!issuer) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const unsigned = await wallet.ctx.buildPresentation(offers, {
          holder: issuer.id,
          type: CREDENTIAL_OFFER_TYPE
        }) as UnsignedPresentation<BundledOffer>

        return {
          presentation: await wallet.ctx.signPresentation(unsigned, issuer),
          did: issuer
        } as OfferBundle<BundledOffer>
      }
    })
  }
}