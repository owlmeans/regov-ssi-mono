
import { DIDDocument, didPurposeList } from '@owlmeans/regov-ssi-did'
import { holderCredentialHelper, verifierCredentialHelper } from '..'
import { CommonContextType } from '../credential/context/types'
import { ERROR_INVALID_PRESENTATION } from '../credential/context/types/presentation'
import { Credential, Presentation, UnsignedPresentation } from '../credential/types'
import {
  CredentialSubjectType,
  Identity,
  IdentitySubject,
  BASE_CREDENTIAL_TYPE,
  UnsignedCredential
} from '../credential/types'
import {
  EntityIdentity,
  UnsignedEntityIdentity,
  EntityIdentitySubjectType,
  EntityIdentitySubject,
  CREDENTIAL_ENTITY_IDENTITY_TYPE,
  IdentityParams
} from './identity/types'
import { ERROR_DESCRIBE_IDENTITY_WITH_PAYLOAD, ERROR_NO_IDENTITY_PROVIDED } from './identity/types'
import { REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES } from './registry/types'
import { WalletWrapper } from './types'


const _getIdentity = <IdentityT extends Identity<IdentitySubject>>(wallet: WalletWrapper) => () => {
  const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
  const identity = registry.getCredential()

  return {
    identity: identity?.credential,
    did: wallet.did.registry.personal.dids.find(
      did => did.did.id === identity?.credential.id
    )?.did
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
>(wallet: WalletWrapper) => {
  const _buildEntityIdnetity = async (entity?: IdentityParams, signer?: DIDDocument) => {
    if (!entity) {
      const identity = _getIdentity(wallet)()
      if (!identity.identity || !identity.did) {
        throw new Error(ERROR_NO_IDENTITY_PROVIDED)
      }
      entity = {
        credential: identity.identity,
        did: identity.did
      }
    }

    const credentialSubject = {
      data: {
        '@type': CREDENTIAL_ENTITY_IDENTITY_TYPE,
        identity: entity.credential
      },
      did: entity.did
    }

    const unsigned = await wallet.ctx.buildCredential<
      EntityIdentitySubjectType, EntityIdentitySubject, UnsignedEntityIdentity
    >({
      id: entity.did.id,
      type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_ENTITY_IDENTITY_TYPE],
      holder: wallet.did.helper().extractProofController(entity.did),
      context: wallet.ctx.buildLDContext(
        'entity/idnetity',
        { did: { '@id': 'scm:did', '@type': '@json' } }
      ),
      subject: credentialSubject
    })

    return await wallet.ctx.signCredential<
      EntityIdentitySubject,
      EntityIdentity,
      UnsignedEntityIdentity
    >(unsigned, signer || entity.did)
  }

  const _helper = {
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

    buildEntity: _buildEntityIdnetity,

    attachEntity: async (
      credentials: (Credential<any> | EntityIdentity)[],
      entity?: EntityIdentity | IdentityParams | boolean
    ) => {
      if (typeof entity === 'boolean') {
        if (!entity) {
          return undefined
        }
      }
      if (typeof entity === 'object') {
        if ('credential' in entity) {
          entity = await _buildEntityIdnetity(entity)
        }
      } else {
        entity = await _buildEntityIdnetity()
      }

      credentials.unshift(entity)

      return entity.credentialSubject.did
    },

    extractEntity: (credentials: (Credential<any> | EntityIdentity)[]) => {
      const entityIdx = credentials.findIndex(
        cred => cred.type.includes(CREDENTIAL_ENTITY_IDENTITY_TYPE)
      )
      if (entityIdx > -1) {
        return credentials.splice(entityIdx, 1)[0]
      }
    },

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
  }

  return _helper
}

export const identityBundler = <
  PayloadT extends {} = {},
  SubjectT extends IdentitySubject<CredentialSubjectType<PayloadT>>
  = IdentitySubject<CredentialSubjectType<PayloadT>>
>(wallet: WalletWrapper) => {
  const holderHelper = holderCredentialHelper(wallet)

  return {
    provide: async (
      identity?: IdentityParams | EntityIdentity | boolean
    ): Promise<Presentation<EntityIdentity>> => {
      return await holderHelper.response({ identity }).build()
    },
    
    /**
     * @TODO Implement proper identity request
     * @TODO Implement proper identity response
     * @TODO Implement proper identity store
     */

    // register: async (presentation: Presentation<EntityIdentity>) => {
    //   const { result, entity } = await verifierCredentialHelper(wallet)
    //     .response().verify(presentation)
    //   if (!result) {
    //     throw new Error(ERROR_INVALID_PRESENTATION)
    //   }
    //   if (!entity) {
    //     throw new Error(ERROR_NO_IDENTITY_PROVIDED)
    //   }
    //   await wallet.did.addPeerDID(entity.credentialSubject.did)
    //   return (await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(
    //     entity.credentialSubject.data.identity,
    //     REGISTRY_SECTION_PEER
    //   )).credential as Identity<SubjectT>
    // }
  }
}