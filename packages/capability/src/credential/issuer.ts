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
  Identity
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  Capability,
  REGISTRY_TYPE_CAPABILITY,
  UnsignedCapability
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

          return await issuerCredentialHelper<Doc, Ext, CapabilityT>(wallet)
            .claim().signClaim(claim, key)
        }
      }

      return _claimHelper
    }
  }

  return _helper
}