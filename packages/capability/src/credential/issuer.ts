import {
  UnsignedClaimCredential,
  ClaimSubject,
  identityHelper,
  issuerCredentialHelper
} from "@owlmeans/regov-ssi-agent"
import {
  WalletWrapper,
  Credential,
  MaybeArray,
  CredentialSubject,
  WrappedDocument,
  KeyPair,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES,
  Identity,
  BasicCredentialType
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  Capability,
  capabilityHolderHelper,
  CAPABILITY_CREDENTIAL_TYPE,
  CREDENTIAL_WITHSOURCE_TYPE,
  isCapability,
  REGISTRY_TYPE_CAPABILITY,
  UnsignedCapability,
  UnsignedCredentialWithSource
} from "."
import {
  CapabilityDoc,
  CapabilityExt,
  CapabilitySubject
} from "./types"


export const capabilityIssuerHelper = <
  Def extends {} = {},
  Ext extends CapabilityExt = CapabilityExt,
  Doc extends CapabilityDoc = CapabilityDoc<Def>
>(wallet: WalletWrapper) => {

  const _extractType = (capability: Capability, sourceType: BasicCredentialType) => {
    const types = capabilityHolderHelper(wallet).capability(capability)
      .getCredentialTypes()
    return types.find(type =>
      (
        Array.isArray(sourceType) ? sourceType : [sourceType]
      ).every(_type => type?.includes(_type))
    )
  }

  const _helper = {
    claim: (source: Capability | Identity) => {
      type CapabilityT = Capability<Def, Ext, CapabilitySubject<Def, Ext, Doc>>
      type UnsignedClaim = UnsignedClaimCredential<
        ClaimSubject<UnsignedCapability<Def, Ext, CapabilitySubject<Def, Ext, Doc>>>
      >

      const _claimHelper = {
        signClaim: async (
          claim: UnsignedClaim,
          key?: KeyPair | string
        ) => {
          const sourceDid = await wallet.did.lookUpDid<DIDDocument>(source?.id)

          claim.credentialSubject.data.credential.credentialSubject.source = source
          claim.credentialSubject.data.credential.credentialSubject.sourceDid = sourceDid

          if (isCapability(source)
            && claim.credentialSubject.data.credential.type.includes(CAPABILITY_CREDENTIAL_TYPE)) {
            /**
             * @TODO type[1] looks like a potential source of bugs
             */
            const capType = _extractType(source, claim.credentialSubject.data.credential.type[1])
            if (capType) {
              let schema = capabilityHolderHelper(wallet).capability(source)
                .getSchema(capType)
              if (schema && !schema.ctxSchema && schema.link) {
                schema = capabilityHolderHelper(wallet).capability(source).getSchema(schema.link)
              }
              if (schema) {
                if (schema && !claim.credentialSubject.data.credential.credentialSubject.schema) {
                  claim.credentialSubject.data.credential.credentialSubject.schema = {
                    type: schema.type,
                    ctxSchema: schema.ctxSchema
                  }
                } else if (
                  Array.isArray(claim.credentialSubject.data.credential.credentialSubject.schema)
                ) {
                  const schemaToPatch = claim.credentialSubject.data
                    .credential.credentialSubject.schema.find(
                      _schema => (
                        Array.isArray(_schema.type) ? _schema.type : [_schema.type]
                      ).every(
                        _type => schema && (Array.isArray(schema.type) ? schema.type : [schema.type])
                          .includes(_type)
                      )
                    )
                  if (schemaToPatch && !schemaToPatch?.ctxSchema) {
                    schemaToPatch.ctxSchema = schema.ctxSchema
                  } else if (!schemaToPatch) {
                    claim.credentialSubject.data.credential.credentialSubject.schema = {
                      type: schema.type,
                      ctxSchema: schema.ctxSchema
                    }
                  }
                }
              }
            }
          }

          return await issuerCredentialHelper<Doc, Ext, CapabilityT>(wallet)
            .claim().signClaim(claim, key)
        }
      }

      return _claimHelper
    },

    capability: (capability: Capability) => {
      const _capabilityHelper = {
        patchCredential: async (unsignedCredential: UnsignedCredentialWithSource) => {
          await Promise.all(
            (
              Array.isArray(unsignedCredential.credentialSubject)
                ? unsignedCredential.credentialSubject : [unsignedCredential.credentialSubject]
            ).map(async subject => {
              subject.source = capability
              subject.sourceDid = await wallet.did.lookUpDid<DIDDocument>(capability.id)

              if (typeof capability.credentialSubject.data.defaults === 'object') {
                Object.entries(capability.credentialSubject.data.defaults).map(
                  ([key, value]) => {
                    const _tmp = subject.data as Record<string, any>
                    if (!_tmp[key]) {
                      _tmp[key] = value
                    }
                  }
                )
              }
            })
          )

          const type = _extractType(capability, unsignedCredential.type[1])
          if (type) {
            const schema = capabilityHolderHelper(wallet).capability(capability)
              .getCredentialSchema(type)
            unsignedCredential["@context"] = [
              ...Array.isArray(unsignedCredential["@context"])
                ? unsignedCredential["@context"] : [unsignedCredential["@context"]],
              ...Array.isArray(schema) ? schema : [schema]
            ]
            unsignedCredential.type.push(CREDENTIAL_WITHSOURCE_TYPE)
          }
        }
      }

      return _capabilityHelper
    }

  }

  return _helper
}