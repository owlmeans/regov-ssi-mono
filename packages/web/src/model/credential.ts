
import { REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES, WalletWrapper } from 'metabelarusid-core'
import { DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION, DIDVerificationItem } from 'metabelarusid-did'

import { buildContext } from './utils'
import { ERROR_VERIFICATION_NOIDENTITY, FreeFormSubject, FREEFORM_CREDENTIAL_TYPES, IdentityPassport, IdentityPassportSubject, IdentityPassportSubjectType, TYPE_CREDENTIAL_FREEFORM } from './types'
import { CredentialClaimState, SignedCredentialState } from '../store/types/credential'


export const credentialHelper = {
  getFreeFormSubjectContent: (subject: FreeFormSubject) => {
    if (Array.isArray(subject)) {
      subject = subject[0]
    }

    return subject.data.freeform
  },

  verify: async (wallet: WalletWrapper, credential: SignedCredentialState): Promise<{
    result: boolean,
    errors: string[],
    issuer?: IdentityPassport
  }> => {
    const issuer = await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(
      credential.did.proof.controller,
      REGISTRY_SECTION_PEER
    )

    if (!issuer) {
      return {
        result: false,
        errors: [ERROR_VERIFICATION_NOIDENTITY],
      }
    }

    const issuerKey = await wallet.did.extractKey(credential.did.proof.controller)
    const [result, info] = await wallet.ctx.verifyCredential(
      credential.credential, 
      issuerKey
    )
    const errors: string[] = []
    if (!result && info.kind === 'invalid') {
      info.errors.forEach(error => errors.push(error.message))
    }

    return {
      result,
      errors,
      issuer: issuer.credential as IdentityPassport
    }
  },

  signClaim: async (wallet: WalletWrapper, claim: CredentialClaimState): Promise<SignedCredentialState> => {
    const key = await wallet.keys.getCryptoKey()

    const did = await wallet.did.helper().signDID(key, claim.did)

    const credential = await wallet.ctx.signCredential(claim.credential, did.proof.controller, key)

    return { credential, did }
  },

  createClaim: async (wallet: WalletWrapper, freeform: string): Promise<CredentialClaimState> => {
    const credentialSubject: FreeFormSubject = {
      data: {
        '@type': TYPE_CREDENTIAL_FREEFORM,
        freeform
      }
    }

    const key = await wallet.keys.getCryptoKey()
    const didUnsigned = await wallet.did.helper().createDID(
      key, {
      data: JSON.stringify(credentialSubject),
      hash: true,
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION]
    }
    )

    const unsignedCredential = await wallet.ctx.buildCredential({
      id: didUnsigned.id,
      type: FREEFORM_CREDENTIAL_TYPES,
      holder: (didUnsigned.verificationMethod[0] as DIDVerificationItem).controller,
      context: buildContext('credential/freeform/v1'),
      subject: credentialSubject
    })

    console.log(unsignedCredential)

    return {
      credential: unsignedCredential,
      did: didUnsigned
    }
  }
}