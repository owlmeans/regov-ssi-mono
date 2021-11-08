import { holderCredentialHelper } from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  KeyPair,
  WalletWrapper,
  Credential
} from "@owlmeans/regov-ssi-core"
import {
  DIDDocument,
  DIDDocumentPurpose,
  DIDDocumentUnsinged
} from "@owlmeans/regov-ssi-did"
import { Capability, CapabilitySubject, CAPABILITY_CREDENTIAL_TYPE, CREDENTIAL_WITHSOURCE_TYPE } from "."
import {
  CapabilityDoc,
  CapabilityExt
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
              ctxSchema: { '@id': 'scm:ctxSchema', '@type': '@json' }
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
    }
  }

  return _helper
}