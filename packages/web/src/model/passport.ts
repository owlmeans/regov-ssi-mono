
import { REGISTRY_TYPE_IDENTITIES, WalletWrapper } from 'metabelarusid-core'
import { didPurposeList } from 'metabelarusid-did'
import {
  IdentityPassportSubject,
  IdentityPassportWrapper,
  PASSPORT_CREDENTIAL_TYPES,
  TYPE_PASSPORT_SUBJECT
} from './types'
import { buildContext } from './utils'


const _getPassport = (wallet: WalletWrapper) => {
  const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
  const identity = registry.getCredential() as IdentityPassportWrapper

  return {
    identity: identity.credential,
    did: wallet.did.registry.personal.dids.find(did => did.did.id === identity.credential.issuer)
  }
}

export const passportHelper = {
  getPassport: _getPassport,

  getPassportInfo: (wallet: WalletWrapper) => {
    const subject = _getPassport(wallet).identity.credentialSubject
    if (Array.isArray(subject)) {
      return subject[0].data.info
    }

    return subject.data.info
  },

  createPassport: async (wallet: WalletWrapper, info: string) => {
    const identitySubject: IdentityPassportSubject = {
      data: {
        '@type': TYPE_PASSPORT_SUBJECT,
        info
      }
    }

    const key = await wallet.keys.getCryptoKey()
    const didUnsigned = await wallet.did.helper().createDID(
      key, {
      purpose: [...didPurposeList]
    }
    )
    const did = await wallet.did.helper().signDID(key, didUnsigned)
    wallet.did.addDID(did)

    const unsignedIdenity = await wallet.ctx.buildCredential({
      id: did.id,
      type: PASSPORT_CREDENTIAL_TYPES,
      holder: did.proof.controller,
      context: buildContext('passport/v1'),
      subject: identitySubject
    })

    const identity = await wallet.ctx.signCredential<IdentityPassportSubject>(unsignedIdenity, did.proof.controller, key)

    const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
    await registry.addCredential(identity)
    registry.registry.rootCredential = identity.id

    console.log(identity.credentialSubject)

    return {
      did,
      identity
    }
  }
}