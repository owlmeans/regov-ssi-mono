import { holderCredentialHelper } from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  KeyPair,
  WalletWrapper,
  Credential
} from "@owlmeans/regov-ssi-core"
import {
  DIDDocument,
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
        build: async (source: Credential, payload: Doc, options?: {
          key?: KeyPair | string,
          didUnsigned?: DIDDocumentUnsinged,
          sourceDid?: DIDDocument
        }) => {
          const subject: CapabilitySubject<Def, Ext, Doc> = {
            data: {
              '@type': claimOptions.type,
              ...payload,
              source,
              sourceDid: options?.sourceDid || await wallet.did.lookUpDid(source.id)
            },
            ...claimOptions.extension
          }

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
              // @TODO Propoer context is needed here
            },
            holder: claimOptions.holder
          }).build(
            subject.data, { key: options?.key, extension: claimOptions.extension }
          )
        }
      }

      return _claimHelper
    }
  }

  return _helper
}