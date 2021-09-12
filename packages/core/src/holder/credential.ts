import {
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
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
  CLAIM_TYPE_PREFFIX
} from "./types";
import { CREDENTIAL_OFFER_TYPE, OfferBundle, OfferCredential } from "../issuer/types";
import { REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES } from "../wallet/registry/types";
import { ERROR_UNTUSTED_ISSUER } from ".";



export const holderCredentialHelper = (wallet: WalletWrapper) => {
  const _identityHelper = identityHelper(wallet)

  return {
    claim: <
      Payload extends {} = {},
      Extension extends {} = {},
      CredentialUT extends UnsignedCredential<
        MaybeArray<CredentialSubject<CredentialSubjectType<Payload>, Extension>>
      > = UnsignedCredential<
        MaybeArray<CredentialSubject<CredentialSubjectType<Payload>, Extension>>
      >
    >(
      claimOptions: {
        type: string,
        schemaUri?: string,
        crdContext?: ContextObj,
        holder?: DIDDocument,
      }
    ) => ({
      build: async (payload: Payload, options: {
        key?: KeyPair | string,
        extension?: Extension
      }) => {
        const credentialSubject = {
          data: {
            '@type': claimOptions.type,
            ...payload
          }
        }

        const key = await wallet.keys.getCryptoKey(options.key)
        const didUnsigned = await wallet.did.helper().createDID(
          key,
          {
            data: JSON.stringify(credentialSubject),
            hash: true,
            purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
          }
        )

        const holder = claimOptions.holder || _identityHelper.getIdentity().did?.did
        if (!holder) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const unsignedCredential = await wallet.ctx.buildCredential<
          CredentialSubjectType<Payload>,
          CredentialSubject<CredentialSubjectType<Payload>, Extension>
        >({
          id: didUnsigned.id,
          type: [BASE_CREDENTIAL_TYPE, claimOptions.type],
          holder: wallet.did.helper().extractProofController(holder),
          context: wallet.ctx.buildLDContext(
            claimOptions.schemaUri || claimOptions.type.toLowerCase(),
            claimOptions.crdContext
          ),
          subject: credentialSubject
        }) as CredentialUT

        const claimSubject: ClaimSubject<CredentialUT> = {
          data: {
            '@type': `${CLAIM_TYPE_PREFFIX}:${claimOptions.type}`,
            credential: unsignedCredential,
          },
          did: didUnsigned
        }

        const claimUnsigned = await wallet.ctx.buildCredential<
          CredentialSubjectType<{ credential: CredentialUT }>,
          ClaimSubject<CredentialUT>
        >({
          id: didUnsigned.id,
          type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_CLAIM_TYPE],
          holder: wallet.did.helper().extractProofController(holder),
          subject: claimSubject,
          context: wallet.ctx.buildLDContext(
            'credential/claim',
            { did: { '@id': 'scm:did', '@type': '@json' } }
          )
        })

        return await wallet.ctx.signCredential(
          claimUnsigned,
          holder
        ) as ClaimCredential<ClaimSubject<CredentialUT>>
      }
    }),

    bundle: <
      BundledClaim extends ClaimCredential,
      BundledOffer extends OfferCredential = OfferCredential
    >(bundleOptions: {
      schemaUri?: string,
      crdContext?: ContextObj,
      holder?: DIDDocument,
    }) => ({
      build: async (claims: BundledClaim[]) => {
        const holder = bundleOptions.holder || _identityHelper.getIdentity().did?.did
        if (!holder) {
          throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
        }

        const unsigned = await wallet.ctx.buildPresentation(claims, {
          holder: holder.id,
          type: CREDENTIAL_CLAIM_TYPE
        }) as UnsignedPresentation<BundledClaim>

        return {
          presentation: await wallet.ctx.signPresentation(unsigned, holder),
          did: holder
        } as ClaimBundle<BundledClaim>
      },

      unbudle: async (bundle: OfferBundle<BundledOffer>) => {
        if (! await wallet.did.helper().verifyDID(bundle.did)) {
          throw new Error(ERROR_UNTUSTED_ISSUER)
        }
        
        const issuer = await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(
          bundle.presentation.holder.id,
          REGISTRY_SECTION_PEER
        )

        if (!issuer) {
          throw new Error(ERROR_UNTUSTED_ISSUER)
        }

        const issuerDid = await wallet.did.lookUpDid<DIDDocument>(issuer.credential.holder.id)


        let [result] = await wallet.ctx.verifyPresentation(
          bundle.presentation,
          issuerDid
        )

        if (!bundle.presentation.type.includes(CREDENTIAL_OFFER_TYPE)) {
          result = false
        }

        

        return [
          result,
          bundle.presentation.verifiableCredential
        ] as [boolean, BundledOffer[]]
      },
    })
  }
}