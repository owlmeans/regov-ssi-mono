import { holderCredentialHelper } from "@owlmeans/regov-ssi-agent"

import {
  ContextSchema,
  KeyPair,
  WalletWrapper,
  Credential,
  BasicCredentialType,
  MultiSchema
} from "@owlmeans/regov-ssi-core"
import {
  DIDDocument,
  DIDDocumentPurpose,
  DIDDocumentUnsinged
} from "@owlmeans/regov-ssi-did"
import { Capability, CapabilitySubject, CAPABILITY_CREDENTIAL_TYPE, CREDENTIAL_WITHSOURCE_TYPE } from "."
import {
  CapabilityDoc,
  CapabilityExt,
  CapabilitySchema
} from "./types"


export const capabilityHolderHelper = <
  Def extends {} = {},
  Ext extends CapabilityExt = CapabilityExt,
  Doc extends CapabilityDoc = CapabilityDoc<Def>
>(wallet: WalletWrapper) => {
  const _helper = {
    claim: (
      claimOptions: {
        type: string | string[],
        schemaUri?: string,
        extension: Ext,
        holder?: DIDDocument
      }
    ) => {
      const _claimHelper = {
        build: async (payload: Doc, options?: {
          key?: KeyPair | string,
          didUnsigned?: DIDDocumentUnsinged,
          sourceDid?: DIDDocument,
          didPurposes?: DIDDocumentPurpose[]
        }) => {
          const type = [
            ...Array.isArray(claimOptions.type) ? claimOptions.type : [claimOptions.type],
            CAPABILITY_CREDENTIAL_TYPE,
            CREDENTIAL_WITHSOURCE_TYPE
          ]

          return await holderCredentialHelper<Doc, Ext,
            Capability<Def, Ext, CapabilitySubject<Def, Ext, Doc>>
          >(wallet).claim({
            type,
            schemaUri: claimOptions.schemaUri,
            crdContext: {
              schema: 'https://schema.org/',
              name: { '@id': 'scm:name', '@type': 'schema:Text' },
              description: { '@id': 'scm:description', '@type': 'schema:Text' },
              source: { '@id': 'scm:source', '@type': 'VerifiableCredential' },
              // @TODO here should be proper reference to DID structure as type
              sourceDid: { '@id': 'scm:sourceDid', '@type': '@json' },
              ctxSchema: { '@id': 'scm:ctxSchema', '@type': '@json' },
              defaults: { '@id': 'scm:defaults', '@type': '@json' },
              link: '@type'
            },
            holder: claimOptions.holder
          }).build(
            { '@type': claimOptions.type, ...payload },
            {
              key: options?.key,
              extension: claimOptions.extension,
              didUnsigned: options?.didUnsigned,
              didPurposes: options?.didPurposes
            }
          )
        }
      }

      return _claimHelper
    },

    capability: (capability: Capability) => {
      const _capabilityHelper = {
        getCredentialTypes: () => {
          if (!Array.isArray(capability.credentialSubject.schema)) {
            return [capability.credentialSubject.schema?.type]
          }

          return capability.credentialSubject.schema.map(schema => schema.type)
        },

        getSchema: (type: BasicCredentialType): CapabilitySchema | undefined => {
          if (!Array.isArray(capability.credentialSubject.schema)) {
            return capability.credentialSubject.schema
          }

          return capability.credentialSubject.schema?.find(schema => {
            if (!Array.isArray(schema.type) || !Array.isArray(type)) {
              return schema.type === type
            }

            return schema.type.every(_type => type.includes(_type))
          })
        },

        getCredentialSchema: (type: BasicCredentialType): MultiSchema => {
          return _capabilityHelper.getSchema(type)?.ctxSchema || []
        }
      }

      return _capabilityHelper
    }
  }

  return _helper
}