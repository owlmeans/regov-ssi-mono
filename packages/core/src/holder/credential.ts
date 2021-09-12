import { DIDDocument, DIDDocumentUnsinged, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION } from "@owlmeans/regov-ssi-did";
import { identityHelper } from "../wallet/identity";
import { CredentialSubject, Credential, CredentialSubjectType, BASE_CREDENTIAL_TYPE, UnsignedCredential } from "../credential/types";
import { WalletWrapper } from "../wallet/types";
import { KeyPair } from "../keys/types";
import { ContextObj, MaybeArray } from "@affinidi/vc-common";
import { ClaimSubject, CREDENTIAL_CLAIM_TYPE, ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL } from "./types";



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
      }
    ) => ({
      createClaim: async (payload: Payload, options: {
        key?: KeyPair | string,
        comKey?: KeyPair | string,
        holder?: DIDDocument,
        extension?: Extension
      }) => {
        // CredentialSubject<CredentialSubjectType<Payload>>
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

        const holder = options.holder || _identityHelper.getIdentity().did?.did
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

        const comKey = await wallet.keys.getCryptoKey(options.comKey)
        const claimSubject: ClaimSubject<CredentialUT> = {
          data: {
            '@type': `Claim${claimOptions.type}`,
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
      }
    })
  }
}