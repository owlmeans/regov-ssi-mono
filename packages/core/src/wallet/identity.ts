
import { MaybeArray } from '@affinidi/vc-common'
import { didPurposeList } from '@owlmeans/regov-ssi-did'
import { CommonContextType } from '../credential/context/types'
import { CredentialSubjectType, Identity, IdentitySubject, BASE_CREDENTIAL_TYPE, UnsignedCredential } from '../credential/types'
import { ERROR_DESCRIBE_IDENTITY_WITH_PAYLOAD } from './identity/types'
import { CredentialWrapper, REGISTRY_TYPE_IDENTITIES } from './registry/types'
import { WalletWrapper } from './types'


const _getIdentity = <IdentityT extends Identity<IdentitySubject>>(wallet: WalletWrapper) => () => {
  const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
  const identity = registry.getCredential()

  return {
    identity: identity?.credential,
    did: wallet.did.registry.personal.dids.find(did => did.did.id === identity?.credential.issuer)
  }
}

const _extractIdentitySubjectData = <
  SubjectT extends IdentitySubject<CredentialSubjectType>
>(subject: SubjectT) => {
  if (Array.isArray(subject)) {
    return (<typeof subject[number]>subject[0]).data
  }

  return subject.data
}

export const identityHelper = <
  PayloadT extends {} = {},
  SubjectT extends IdentitySubject<CredentialSubjectType<PayloadT>> = IdentitySubject<CredentialSubjectType<PayloadT>>
>(
  wallet: WalletWrapper
) => ({
  getIdentity: _getIdentity<Identity<SubjectT>>(wallet),

  getIdentityData: () => {
    const identity = _getIdentity<Identity<SubjectT>>(wallet)().identity
    if (!identity) {
      return undefined
    }
    return _extractIdentitySubjectData(
      identity.credentialSubject as SubjectT
    )
  },

  extractIdentitySubjectData: (subject: SubjectT) =>
    _extractIdentitySubjectData<SubjectT>(subject),

  createIdentity: async <
    IdentityT extends Identity<SubjectT> = Identity<SubjectT>
  >(
    type: string,
    payload: PayloadT,
    extension: SubjectT extends IdentitySubject<any, infer Extension> ? Extension : never,
    idtContext?: CommonContextType
  ) => {
    const identitySubject = {
      data: {
        '@type': type,
        ...(payload || {})
      },
      ...(extension ? extension : {})
    } as SubjectT

    if (!idtContext) {
      if (payload) {
        throw new Error(ERROR_DESCRIBE_IDENTITY_WITH_PAYLOAD)
      }
      idtContext = wallet.ctx.buildLDContext('identity')
    }

    const key = await wallet.keys.getCryptoKey()
    const didUnsigned = await wallet.did.helper().createDID(
      key, { purpose: [...didPurposeList] }
    )
    const did = await wallet.did.helper().signDID(key, didUnsigned)
    wallet.did.addDID(did)

    const unsignedIdenity = await wallet.ctx.buildCredential<
      CredentialSubjectType<PayloadT>,
      SubjectT,
      UnsignedCredential<SubjectT>
    >({
      id: did.id,
      type: [BASE_CREDENTIAL_TYPE, type],
      holder: wallet.ctx.did.helper().extractProofController(did),
      context: idtContext,
      subject: identitySubject
    })

    const identity = await wallet.ctx.signCredential<SubjectT, IdentityT>(
      unsignedIdenity, did
    )

    const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
    await registry.addCredential(identity)
    registry.registry.rootCredential = identity.id

    return {
      did,
      identity: identity
    }
  }
})