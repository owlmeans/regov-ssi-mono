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
import { ContextObj } from "@affinidi/vc-common";
import {
  ClaimSubject,
  ClaimCredential,
  CREDENTIAL_CLAIM_TYPE,
  ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL,
  ClaimBundle,
  CLAIM_TYPE_PREFFIX,
  ClaimExtenstion,
  ClaimPayload,
  ERROR_UNTUSTED_ISSUER
} from "./types";
import {
  CREDENTIAL_OFFER_TYPE,
  OfferBundle,
  OfferCredential
} from "../issuer/types";
import {
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_CLAIMS,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES
} from "../wallet/registry/types";


export const holderCredentialHelper = (wallet: WalletWrapper) => {
  const _identityHelper = identityHelper(wallet)

  return {
    claim: <
      Payload extends {} = {},
      Extension extends {} = {},
      CredentialUT extends UnsignedCredential<
        CredentialSubject<CredentialSubjectType<Payload>, Extension>
      > = UnsignedCredential<
        CredentialSubject<CredentialSubjectType<Payload>, Extension>
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
      },

      register: async (
        bundle: ClaimBundle<ClaimCredential<ClaimSubject<CredentialUT>>>
      ) => {
        await wallet.getRegistry(REGISTRY_TYPE_CLAIMS)
          .addCredential<
            CredentialSubject<CredentialSubjectType<Payload>, Extension>,
            Presentation<ClaimCredential<ClaimSubject<CredentialUT>>>
          >(bundle.presentation)
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

        type Payload = ClaimPayload<BundledClaim>
        type Extension = ClaimExtenstion<BundledClaim>

        const claims = wallet.getRegistry(REGISTRY_TYPE_CLAIMS).getCredential<
          CredentialSubject<CredentialSubjectType<Payload>, Extension>,
          Presentation<ClaimCredential<ClaimSubject<
            UnsignedCredential<CredentialSubject<CredentialSubjectType<Payload>, Extension>>
          >>>
        >(bundle.presentation.id)

        if (result && claims) {
          result = false
          if (claims.credential.verifiableCredential.length
            === bundle.presentation.verifiableCredential.length) {
            const offers = bundle.presentation.verifiableCredential.map(
              offer => offer.credentialSubject.data.credential.id
            )
            result = claims.credential.verifiableCredential.some(
              claim => !offers.includes(claim.credentialSubject.data.credential.id)
            )
          }
          if (!result) {
            console.log()
          }
        }

        return [result, bundle.presentation.verifiableCredential] as [boolean, BundledOffer[]]
      },

      store: async (bundle: OfferBundle<BundledOffer>) => {
        type Payload = ClaimPayload<BundledClaim>
        type Extension = ClaimExtenstion<BundledClaim>
        type SubjectT = CredentialSubject<CredentialSubjectType<Payload>, Extension>

        const registry = wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
        return Promise.all(bundle.presentation.verifiableCredential.map(
          async (offer) => {
            wallet.did.addDID(offer.credentialSubject.did)
            return await registry.addCredential<SubjectT, Credential<SubjectT>>(
              offer.credentialSubject.data.credential as Credential<SubjectT>
            )
          }
        ))
      }
    })
  }
}