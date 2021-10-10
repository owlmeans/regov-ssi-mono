import {
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_VERIFICATION,
  VERIFICATION_KEY_CONTROLLER,
  VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-did";
import { identityHelper } from "../identity";
import {
  CredentialSubject,
  Credential,
  WrappedDocument,
  BASE_CREDENTIAL_TYPE,
  UnsignedCredential,
  UnsignedPresentation,
  MaybeArray,
  WalletWrapper,
  KeyPair,
} from "@owlmeans/regov-ssi-core";
import {
  ClaimSubject,
  ClaimCredential,
  CREDENTIAL_CLAIM_TYPE,
  ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL,
  ClaimBundle,
  ERROR_WRONG_CLAIM_SUBJECT_TYPE,
  CLAIM_TYPE_PREFIX,
  ERROR_UNTRUSTED_ISSUER
} from "../holder/types";
import {
  CREDENTIAL_OFFER_TYPE,
  IssuerVisitor,
  OfferBundle,
  OfferCredential,
  OfferSubject
} from "./types";
import { EntityIdentity, IdentityParams } from "../identity/types";
import { buildLocalLoader } from "../verifier/loader";


export const issuerCredentialHelper = <
  Payload extends {} = {},
  Extension extends {} = {},
  CredentialT extends Credential<
    MaybeArray<CredentialSubject<WrappedDocument<Payload>, Extension>>
  > = Credential<
    MaybeArray<CredentialSubject<WrappedDocument<Payload>, Extension>>
  >,
  VisitorExtension extends {} = {}
>(wallet: WalletWrapper, visitor?: IssuerVisitor<VisitorExtension, CredentialT>) => {
  const _identityHelper = identityHelper(wallet)

  return {
    claim: (issuer?: DIDDocument) => {
      type UnsignedClaim = ClaimCredential<
        ClaimSubject<
          UnsignedCredential<
            CredentialSubject<WrappedDocument<Payload>, Extension>
          >
        >
      >

      const _claimHelper = {
        signClaim: async (
          claim: UnsignedClaim,
          key?: KeyPair | string
        ) => {
          issuer = issuer || _identityHelper.getIdentity().did
          if (!issuer) {
            throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
          }

          const signingKey = await wallet.keys.getCryptoKey(key)

          const did = await wallet.did.helper().signDID(
            signingKey,
            JSON.parse(JSON.stringify(claim.credentialSubject.did)),
            VERIFICATION_KEY_CONTROLLER,
            [DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION]
          )

          const signingIssuer = visitor?.claim?.signClaim?.clarifyIssuer
            ? await visitor?.claim?.signClaim?.clarifyIssuer(
              claim.credentialSubject.data.credential as any
            ) : did // issuer <- it's ok for self issueing

          const credential = await wallet.ssi.signCredential(
            claim.credentialSubject.data.credential,
            did, // signingIssuer, <- Actually this is totally wrong approach
            { keyId: VERIFICATION_KEY_CONTROLLER }
          ) as CredentialT

          let subjectType: string | string[] = claim.credentialSubject.data["@type"]
          subjectType = Array.isArray(subjectType) ? subjectType : [subjectType]

          const mainType = subjectType[0]
          const [prefix, type] = mainType.split(':', 2)

          if (!type && prefix !== CLAIM_TYPE_PREFIX) {
            throw new Error(ERROR_WRONG_CLAIM_SUBJECT_TYPE)
          }

          const offerSubject: OfferSubject<CredentialT> = {
            data: {
              '@type': `Offer:${type}`,
              credential,
            },
            did
          }

          const offerUnsigned = await wallet.ssi.buildCredential<
            WrappedDocument<{ credential: CredentialT }>,
            OfferSubject<CredentialT, VisitorExtension>
          >(
            {
              id: did.id,
              type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_OFFER_TYPE],
              holder: wallet.did.helper().extractProofController(issuer),
              subject: offerSubject,
              context: wallet.ssi.buildContext(
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

          visitor?.claim?.signClaim?.patchOffer
            && await visitor.claim.signClaim.patchOffer(offerUnsigned, signingIssuer)

          debugger
          return await wallet.ssi.signCredential(
            offerUnsigned, issuer,
            //            { keyId: VERIFICATION_KEY_CONTROLLER }
          ) as OfferCredential<OfferSubject<CredentialT, VisitorExtension>>
        },

        signClaims: async (claims: UnsignedClaim[], key?: KeyPair | string) => {
          return await Promise.all(
            claims.map(claim => _claimHelper.signClaim(claim, key))
          )
        }
      }

      return _claimHelper
    },

    bundle: <
      BundledClaim extends ClaimCredential,
      BundledOffer extends OfferCredential<OfferSubject<CredentialT, VisitorExtension>>
      = OfferCredential<OfferSubject<CredentialT, VisitorExtension>>
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

        const errors: string[] = []
        let [result, info] = await wallet.ssi.verifyPresentation(
          bundle, did, buildLocalLoader(wallet)
        )

        if (!result && info.kind === 'invalid') {
          info.errors.map(err => {
            console.log(err.message)
            errors.push(err.message)
          })
        }

        result = result && bundle.type.includes(CREDENTIAL_CLAIM_TYPE)

        return { result, claims, entity, errors } as {
          result: boolean
          claims: BundledClaim[],
          entity?: EntityIdentity,
          errors: typeof errors
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

        const unsigned = await wallet.ssi.buildPresentation(offers, {
          id,
          holder: issuer.id,
          type: CREDENTIAL_OFFER_TYPE
        }) as UnsignedPresentation<BundledOffer>

        return await wallet.ssi.signPresentation(unsigned, issuer) as OfferBundle<BundledOffer>
      }
    })
  }
}