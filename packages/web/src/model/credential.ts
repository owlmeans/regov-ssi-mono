
import { WalletWrapper } from 'metabelarusid-core'
import { DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION, DIDVerificationItem } from 'metabelarusid-did'

import { buildContext } from './utils'
import { FreeFormSubject, FREEFORM_CREDENTIAL_TYPES, TYPE_CREDENTIAL_FREEFORM } from './types'
import { CredentialClaimState, SignedCredentialState } from '../store/types/credential'


export const credentialHelper = {
  getFreeFormSubjectContent: (subject: FreeFormSubject) => {
    if (Array.isArray(subject)) {
      subject = subject[0]
    }

    return subject.data.freeform
  },

  signClaim: async (wallet: WalletWrapper, claim: CredentialClaimState): Promise<SignedCredentialState> => {
    const key = await wallet.keys.getCryptoKey()

    const did = await wallet.did.helper().signDID(key, claim.did)

    const credential = await wallet.ctx.signCredential(claim.credential, did.proof.controller, key)

    return { credential, did}
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