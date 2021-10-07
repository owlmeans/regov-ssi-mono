
import { DIDDocument, didPurposeList } from '@owlmeans/regov-ssi-did'
import { RequestBundle } from '../verifier/types'
import { verifierCredentialHelper } from '../verifier/credential'
import { holderCredentialHelper } from '../holder/credential'
import { 
  Credential, 
  Presentation ,
  WrappedDocument,
  Identity,
  IdentitySubject,
  BASE_CREDENTIAL_TYPE,
  UnsignedCredential,
  CredentialContextType,
  REGISTRY_SECTION_OWN, 
  REGISTRY_SECTION_PEER, 
  REGISTRY_TYPE_IDENTITIES,
  WalletWrapper,
  isPresentation,
  ERROR_INVALID_PRESENTATION
} from '@owlmeans/regov-ssi-core'

import {
  EntityIdentity,
  UnsignedEntityIdentity,
  EntityIdentitySubjectType,
  EntityIdentitySubject,
  CREDENTIAL_ENTITY_IDENTITY_TYPE,
  IdentityParams,
  ERROR_DESCRIBE_IDENTITY_WITH_EXTENSION, 
  ERROR_NO_IDENTITY_PROVIDED
} from './types'


const _getIdentity = <IdentityT extends Identity<IdentitySubject>>(wallet: WalletWrapper) => () => {
  const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
  const identity = registry.getCredential()

  return {
    identity: identity?.credential as IdentityT,
    did: wallet.did.registry.personal.dids.find(
      did => did.did.id === identity?.credential.id
    )?.did
  }
}

const _extractIdentitySubjectData = <
  SubjectT extends IdentitySubject<WrappedDocument>
>(subject: SubjectT) => {
  if (Array.isArray(subject)) {
    return (<typeof subject[number]>subject[0]).data
  }

  return subject.data
}

export const identityHelper = <
  PayloadT extends {} = {},
  SubjectT extends IdentitySubject<WrappedDocument<PayloadT>> = IdentitySubject<WrappedDocument<PayloadT>, {}>
>(wallet: WalletWrapper, idtContext?: CredentialContextType) => {
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

    const unsigned = await wallet.ssi.buildCredential<
      EntityIdentitySubjectType, EntityIdentitySubject, UnsignedEntityIdentity
    >({
      id: entity.did.id,
      type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_ENTITY_IDENTITY_TYPE],
      holder: wallet.did.helper().extractProofController(entity.did),
      context: wallet.ssi.buildContext(
        'entity/idnetity',
        /**
         * @TODO Decribe context properly
         */
        { 
          did: { '@id': 'scm:did', '@type': '@json' },
          identity: { '@id': 'scm:identity', '@type': '@json' }
        }
      ),
      subject: credentialSubject
    })

    return await wallet.ssi.signCredential<
      EntityIdentitySubject,
      EntityIdentity,
      UnsignedEntityIdentity
    >(unsigned, signer || entity.did)
  }

  const _castEntity = async (entity?: EntityIdentity | IdentityParams | boolean) => {
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

    return entity
  }

  const _helper = {
    getIdentity: _getIdentity<Identity<SubjectT>>(wallet),

    getIdentityData: () => {
      const identity = _getIdentity<Identity<SubjectT>>(wallet)().identity
      if (!identity) {
        return undefined
      }
      return _extractIdentitySubjectData<SubjectT>(
        identity.credentialSubject
      )
    },

    extractIdentitySubjectData: (subject: SubjectT) =>
      _extractIdentitySubjectData<SubjectT>(subject),

    buildEntity: _buildEntityIdnetity,

    castEntity: _castEntity,

    attachEntity: async (
      credentials: (Credential<any> | EntityIdentity)[],
      entity?: EntityIdentity | IdentityParams | boolean
    ) => {
      entity = await _castEntity(entity)
      if (!entity) {
        return
      }

      credentials.unshift(entity)

      return entity.credentialSubject.did
    },

    extractEntity: (credentials: (Credential<any> | EntityIdentity)[]) => {
      const entityIdx = credentials.findIndex(
        cred => cred.type.includes(CREDENTIAL_ENTITY_IDENTITY_TYPE)
      )
      if (entityIdx > -1) {
        return credentials.splice(entityIdx, 1)[0] as EntityIdentity
      }
    },

    createIdentity: async <
      IdentityT extends Identity<SubjectT> = Identity<SubjectT>
    >(
      type: string,
      payload: PayloadT,
      extension?: SubjectT extends IdentitySubject<any, infer Extension> ? Extension : never
    ) => {
      const identitySubject = {
        data: {
          '@type': type,
          ...(payload || {})
        },
        ...(extension ? extension : {})
      } as SubjectT

      if (!idtContext) {
        if (payload || extension) {
          throw new Error(ERROR_DESCRIBE_IDENTITY_WITH_EXTENSION)
        }
        idtContext = wallet.ssi.buildContext('identity')
      }

      const key = await wallet.keys.getCryptoKey()
      const didUnsigned = await wallet.did.helper().createDID(
        key, { purpose: [...didPurposeList] }
      )
      const did = await wallet.did.helper().signDID(key, didUnsigned)
      wallet.did.addDID(did)

      const unsignedIdenity = await wallet.ssi.buildCredential<
        WrappedDocument<PayloadT>,
        SubjectT,
        UnsignedCredential<SubjectT>
      >({
        id: did.id,
        type: [BASE_CREDENTIAL_TYPE, type],
        holder: wallet.ssi.did.helper().extractProofController(did),
        context: idtContext,
        subject: identitySubject
      })

      const identity = await wallet.ssi.signCredential<SubjectT, IdentityT>(
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
  SubjectT extends IdentitySubject<WrappedDocument<PayloadT>>
  = IdentitySubject<WrappedDocument<PayloadT>>
>(wallet: WalletWrapper) => {
  return {
    response: async (
      identity?: IdentityParams | EntityIdentity | RequestBundle
    ): Promise<Presentation<EntityIdentity>> => {
      if (isPresentation(identity)) {
        let credential = identityHelper(wallet).getIdentity()
        if (identity.proof.challenge.startsWith('with-params')) {
          const [, queryId] = identity.proof.challenge.split(':')
          const reg = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).registry
          if (typeof queryId === 'string') {
            const query = wallet.did.helper().parseDIDId(queryId)
            const cred = reg.credentials[REGISTRY_SECTION_OWN].find((cred) => {
              if (query.query && query.query['issuer']) {
                if (Array.isArray(query.query['issuer'])) {
                  if (!query.query['issuer'].find(issuer =>
                    issuer === cred.credential.issuer
                  )) {
                    return false
                  }
                } else {
                  if (cred.credential.issuer !== query.query['issuer']) {
                    return false
                  }
                }
              }
              if (query.query && query.query['type']) {
                if (Array.isArray(query.query['type'])) {
                  if (!query.query['type'].every(type => cred.credential.type.includes(type))) {
                    return false
                  }
                } else {
                  if (!cred.credential.type.includes(query.query['type'])) {
                    return false
                  }
                }
              }
              return true
            })?.credential as Identity<SubjectT> | undefined
            if (cred) {
              credential = {
                identity: cred,
                did: await wallet.did.lookUpDid<DIDDocument>(cred.id) as DIDDocument
              }
            }
          }
        }

        if (!credential) {
          throw new Error(ERROR_NO_IDENTITY_PROVIDED)
        }
        if (!credential.identity) {
          throw new Error(ERROR_NO_IDENTITY_PROVIDED)
        }

        identity = {
          credential: credential.identity,
          did: credential.did as DIDDocument
        }
      }

      return await holderCredentialHelper(wallet).response({ identity })
        .build() as Presentation<EntityIdentity>
    },

    request: async (
      identity?: IdentityParams | EntityIdentity | true,
      options?: { issuer?: string | string[], type?: string | string[] }
    ): Promise<RequestBundle> => {
      identity = await identityHelper(wallet).castEntity(identity) as EntityIdentity
      return await verifierCredentialHelper(wallet)
        .request(identity.credentialSubject.did).bundle([], identity, {
          challenge: options ? `with-params:${wallet.did.helper().makeDIDId(
            { id: identity.credentialSubject.did.id },
            {
              hash: false, query: {
                ...(options?.issuer ? { issuer: options?.issuer } : {}),
                ...(options?.type ? { type: options?.type } : {})
              }
            })}` : undefined
        })
    },

    trust: async (presentation: Presentation<EntityIdentity>) => {
      const { result, entity } = await verifierCredentialHelper(wallet)
        .response().verify(presentation)
      if (!result) {
        throw new Error(ERROR_INVALID_PRESENTATION)
      }
      if (!entity) {
        throw new Error(ERROR_NO_IDENTITY_PROVIDED)
      }
      await wallet.did.addPeerDID(entity.credentialSubject.did)
      return (await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(
        entity.credentialSubject.data.identity,
        REGISTRY_SECTION_PEER
      )).credential as Identity<SubjectT>
    }
  }
}