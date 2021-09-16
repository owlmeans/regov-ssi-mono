import {
  DIDDocument,
  VERIFICATION_KEY_CONTROLLER,
  VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-did";
import { identityHelper } from "../wallet/identity";
import {
  CredentialSubject,
  Credential,
  WrappedDocument,
  BASE_CREDENTIAL_TYPE,
  UnsignedCredential,
  UnsignedPresentation,
  MaybeArray,
} from "../credential/types";
import { WalletWrapper } from "../wallet/types";
import { KeyPair } from "../keys/types";
import {
  ClaimSubject,
  ClaimCredential,
  CREDENTIAL_CLAIM_TYPE,
  ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL,
  ClaimBundle,
  ERROR_WRONG_CLAIM_SUBJECT_TYPE,
  CLAIM_TYPE_PREFFIX,
  ERROR_UNTRUSTED_ISSUER
} from "../holder/types";
import {
  CREDENTIAL_OFFER_TYPE,
  OfferBundle,
  OfferCredential,
  OfferSubject
} from "./types";
import { EntityIdentity, IdentityParams } from "../wallet/identity/types";


export const issuerCredentialHelper = (wallet: WalletWrapper) => {
  const _identityHelper = identityHelper(wallet)

  return {
    claim: <
      Payload extends {} = {},
      Extension extends {} = {},
      CredentialT extends Credential<
        MaybeArray<CredentialSubject<WrappedDocument<Payload>, Extension>>
      > = Credential<
        MaybeArray<CredentialSubject<WrappedDocument<Payload>, Extension>>
      >
    >(issuer?: DIDDocument) => {
      type UnsignedClaim = ClaimCredential<
        ClaimSubject<
          UnsignedCredential<
            CredentialSubject<WrappedDocument<Payload>, Extension>
          >
        >
      >

      const _signClaim = async (
        claim: UnsignedClaim,
        key?: KeyPair | string
      ) => {
        issuer = issuer || _identityHelper.getIdentity().did
        if (!issuer) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const signingKey = await wallet.keys.getCryptoKey(key)

        const did = await wallet.did.helper().signDID(signingKey, claim.credentialSubject.did)

        const credential = await wallet.ctx.signCredential(
          claim.credentialSubject.data.credential,
          issuer, {
            keyId: VERIFICATION_KEY_HOLDER
          }
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
          WrappedDocument<{ credential: CredentialT }>,
          OfferSubject<CredentialT>
        >(
          {
            id: did.id,
            type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_OFFER_TYPE],
            holder: wallet.did.helper().extractProofController(issuer),
            subject: offerSubject,
            context: wallet.ctx.buildLDContext(
              'credential/claim',
              /**
               * @TODO Use some proper schema
               */
              { 
                did: { '@id': 'scm:did', '@type': '@json' },
                credential: { '@id': 'scm:credential', '@type': '@json' },
              }
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
      issuer?: DIDDocument,
      identity?: IdentityParams | EntityIdentity | boolean
    ) => ({
      unbudle: async (bundle: ClaimBundle<BundledClaim>) => {
        const claims = [...bundle.verifiableCredential]
        const entity = _identityHelper.extractEntity(claims)

        const did = entity?.credentialSubject.did
        if (!did || !await wallet.did.helper().verifyDID(did)) {
          throw new Error(ERROR_UNTRUSTED_ISSUER)
        }

        let [result] = await wallet.ctx.verifyPresentation(bundle, did)

        result = result && bundle.type.includes(CREDENTIAL_CLAIM_TYPE)

        return { result, claims, entity } as {
          result: boolean
          claims: BundledClaim[],
          entity?: EntityIdentity
        }
      },

      build: async (
        offers: BundledOffer[],
        id?: string
      ) => {
        offers = [...offers]
        await _identityHelper.attachEntity(offers, identity)
        issuer = issuer || _identityHelper.getIdentity().did
        if (!issuer) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const unsigned = await wallet.ctx.buildPresentation(offers, {
          id,
          holder: issuer.id,
          type: CREDENTIAL_OFFER_TYPE
        }) as UnsignedPresentation<BundledOffer>

        return await wallet.ctx.signPresentation(unsigned, issuer) as OfferBundle<BundledOffer>
      }
    })
  }
}