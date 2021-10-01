
import {
  ClaimCredential,
  holderCredentialHelper,
  issuerCredentialHelper
} from "@owlmeans/regov-ssi-agent"
import {
  WalletWrapper,
  Credential,
  KeyPair
} from "@owlmeans/regov-ssi-core"
import {
  DIDDocument,
  DIDPURPOSE_CAPABILITY,
  DIDPURPOSE_DELEGATION
} from "@owlmeans/regov-ssi-did"
import { issuerGovernanceVisitor } from "./issuer"
import {
  CapabilityDocument,
  CREDENTIAL_CAPABILITY_TYPE,
  UnsignedCapabilityCredential,
  CapabilityExtension,
  CapabilitySubject,
  CREDENTIAL_GOVERNANCE_TYPE,
  CapabilityCredential,
  CapabilityClaimSubject,
  OfferCapabilityExtension
} from "./types"


export const isCapability = (credential: Credential | undefined): credential is CapabilityCredential => {
  return credential?.type.includes(CREDENTIAL_CAPABILITY_TYPE) || false
}

export const isGovernanceCapability = (credential: Credential | undefined): credential is CapabilityCredential => {
  return (
    credential?.type.includes(CREDENTIAL_CAPABILITY_TYPE)
    && credential.type.includes(CREDENTIAL_GOVERNANCE_TYPE)
  ) || false
}

export const governanceCredentialHelper = (wallet: WalletWrapper) => {
  const _helper = {
    claim: async <
      PayloadProps extends {} = {},
      ExtensionProps extends {} = {},
      CredentialProps extends {} = {}
    >(
      source: Credential,
      descr: {
        root?: Credential,
        name: string,
        description?: string,
        type?: string | string[],
        key?: string | KeyPair
      },
      capability: CapabilityDocument<PayloadProps, ExtensionProps, CredentialProps>
    ) => {
      const holder = await wallet.did.lookUpDid<DIDDocument>(source.id)

      const claim = await holderCredentialHelper<
        CapabilityDocument<PayloadProps, ExtensionProps, CredentialProps>,
        CapabilityExtension,
        CapabilityCredential<CapabilitySubject<PayloadProps, ExtensionProps, CredentialProps>>
      >(wallet).claim({
        type: [
          CREDENTIAL_CAPABILITY_TYPE,
          ...(descr.type ? Array.isArray(descr.type) ? descr.type : [descr.type] : [])
        ],
        schemaUri: 'governance/capability',
        crdContext: {
          credentialSchema: { '@id': 'scm:credentialSchema', '@type': '@json' },
          subjectSchema: { '@id': 'scm:subjectSchema', '@type': '@json' },
          credentialProps: { '@id': 'scm:credentialProps', '@type': '@json' },
          subjectProps: { '@id': 'scm:subjectProps', '@type': '@json' },
          selfIssuing: { '@id': 'scm:selfIssuing', '@type': 'xsd:boolean' },
          name: { '@id': 'scm:name', '@type': 'xsd:string' },
          source: { '@id': 'scm:source', '@type': 'xsd:string' },
          root: { '@id': 'scm:root', '@type': 'xsd:root' },
          ...(capability.credentialSchema ? capability.credentialSchema : {}),
          ...(capability.subjectSchema ? capability.subjectSchema : {})
        },
        holder
      }).build(capability, {
        key: descr.key,
        /**
         * @TODO Did needs an invocation? capability
         */
        extension: {
          source: source.id,
          name: descr.name,
          ...(descr.description ? { description: descr.description } : {}),
          ...(descr.root ? { root: descr.root.id } : {})
        }
      })

      const key = await wallet.keys.getCryptoKey(descr?.key)

      claim.credentialSubject.did = await wallet.did.helper().createDID(key, {
        source: claim.credentialSubject.did,
        purpose: [
          DIDPURPOSE_CAPABILITY,
          DIDPURPOSE_DELEGATION,
        ]
      })

      return claim
    },

    claimGovernance: async (
      source: Credential,
      descr: {
        root?: Credential,
        name: string,
        description?: string
        key?: KeyPair | string
      }
    ) => {
      const claim = await _helper.claim(source, {
        ...descr,
        type: CREDENTIAL_GOVERNANCE_TYPE
      }, { '@type': [CREDENTIAL_GOVERNANCE_TYPE] })

      return claim as ClaimCredential<CapabilityClaimSubject>
    },

    offer: async <
      PayloadProps extends {} = {},
      ExtensionProps extends {} = {},
      CredentialProps extends {} = {},
      >(
        claim: ClaimCredential<CapabilityClaimSubject<PayloadProps, ExtensionProps, CredentialProps>>
      ) => {

      return await issuerCredentialHelper<
        CapabilityDocument<PayloadProps, ExtensionProps, CredentialProps>,
        CapabilityExtension,
        CapabilityCredential<CapabilitySubject<PayloadProps, ExtensionProps, CredentialProps>>,
        OfferCapabilityExtension
      >(wallet, issuerGovernanceVisitor(wallet)).claim().signClaim(claim)
    }
  }

  return _helper
}