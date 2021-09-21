
import { holderCredentialHelper } from "@owlmeans/regov-ssi-agent"
import { WalletWrapper, Credential } from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  CapabilityDocument,
  CREDENTIAL_CAPABILITY_TYPE,
  UnsignedCapabilityCredential,
  CapabilityExtension,
  CapabilitySubject,
  CREDENTIAL_GOVERNANCE_TYPE
} from "./types"


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
        type?: string | string[]
      },
      capability: CapabilityDocument<PayloadProps, ExtensionProps, CredentialProps>
    ) => {
      const holder = await wallet.did.lookUpDid<DIDDocument>(source.id)

      const claim = await holderCredentialHelper(wallet).claim<
        CapabilityDocument<PayloadProps, ExtensionProps, CredentialProps>,
        CapabilityExtension,
        UnsignedCapabilityCredential<CapabilitySubject<PayloadProps, ExtensionProps, CredentialProps>>
      >({
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
          ...(capability.credentialSchema ? capability.credentialSchema : {}),
          ...(capability.subjectSchema ? capability.subjectSchema : {})
        },
        holder
      }).build(capability, {
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

      return claim
    },

    claimGovernanceCapability: async (
      source: Credential,
      descr: {
        root?: Credential,
        name: string,
        description?: string
      }
    ) => {
      return await _helper.claim(source, {
        ...descr,
        type: CREDENTIAL_GOVERNANCE_TYPE
      }, { '@type': [CREDENTIAL_GOVERNANCE_TYPE] })
    }
  }

  return _helper
}