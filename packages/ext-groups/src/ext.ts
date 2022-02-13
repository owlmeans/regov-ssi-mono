import {
  addObserverToSchema,
  buildExtension,
  buildExtensionSchema,
  defaultBuildingFactory,
  defaultSigningFactory,
  EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  EXTENSION_TRIGGER_RETRIEVE_NAME,
  IncommigDocumentEventParams,
  RetreiveNameEventParams
} from "@owlmeans/regov-ssi-extension"
import {
  REGISTRY_TYPE_IDENTITIES,
  REGISTRY_TYPE_CREDENTIALS,
  UnsignedCredential,
  getCompatibleSubject,
  isPresentation
} from '@owlmeans/regov-ssi-core'
import {
  BASIC_IDENTITY_TYPE,
  GroupSubject,
  MembershipSubject,
  RegovGroupExtensionTypes,
  REGOV_CLAIM_TYPE,
  REGOV_CREDENTIAL_TYPE_GROUP,
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
  REGOV_EXT_GROUP_NAMESPACE,
  REGOV_OFFER_TYPE
} from "./types"
import { makeRandomUuid } from "@owlmeans/regov-ssi-common"


let groupsExtensionSchema = buildExtensionSchema<RegovGroupExtensionTypes>({
  name: 'extension.details.name',
  code: 'owlmean-regov-groups',
  types: {
    claim: REGOV_CLAIM_TYPE
  }
}, {
  [REGOV_CREDENTIAL_TYPE_GROUP]: {
    mainType: REGOV_CREDENTIAL_TYPE_GROUP,
    defaultNameKey: 'cred.group.name',
    credentialContext: {
      '@version': 1.1,
      uuid: "http://www.w3.org/2001/XMLSchema#string",
      name: "http://www.w3.org/2001/XMLSchema#string",
      description: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: {
      type: BASIC_IDENTITY_TYPE,
      signing: true,
    },
    registryType: REGISTRY_TYPE_CREDENTIALS,
    selfIssuing: true,
    claimable: false,
    listed: true,
  },
  [REGOV_CREDENTIAL_TYPE_MEMBERSHIP]: {
    mainType: REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
    mandatoryTypes: [BASIC_IDENTITY_TYPE],
    defaultNameKey: 'cred.membership.name',
    credentialContext: {
      '@version': 1.1,
      groupId: "http://www.w3.org/2001/XMLSchema#string",
      role: "http://www.w3.org/2001/XMLSchema#string",
      memberCode: "http://www.w3.org/2001/XMLSchema#string",
      description: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    registryType: REGISTRY_TYPE_IDENTITIES,
    selfIssuing: false,
    claimable: true,
    listed: true,
    evidence: [
      {
        type: BASIC_IDENTITY_TYPE,
        signing: true
      },
      {
        type: REGOV_CREDENTIAL_TYPE_GROUP
      }
    ]
  },
  [REGOV_CLAIM_TYPE]: {
    mainType: REGOV_CLAIM_TYPE,
    credentialContext: {}
  }
})

groupsExtensionSchema = addObserverToSchema(groupsExtensionSchema, {
  trigger: EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  filter: async (_, params: IncommigDocumentEventParams) => {
    if (isPresentation(params.credential)) {
      if ([REGOV_CLAIM_TYPE, REGOV_OFFER_TYPE].some(type => params.credential.type.includes(type))) {
        return true
      }
    }

    if (!params.credential.type || !Array.isArray(params.credential.type)) {
      return false
    }

    return params.credential.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
  },
})

groupsExtensionSchema = addObserverToSchema(groupsExtensionSchema, {
  trigger: EXTENSION_TRIGGER_RETRIEVE_NAME,
  filter: async (_, params: RetreiveNameEventParams) => {
    if (!params.credential.type || !Array.isArray(params.credential.type)) {
      return false
    }

    return params.credential.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
  },

  method: async (_, { credential, setName }: RetreiveNameEventParams) => {
    const subject = getCompatibleSubject<GroupSubject>(credential)
    setName(subject.name)
  }
})

groupsExtensionSchema = addObserverToSchema(groupsExtensionSchema, {
  trigger: EXTENSION_TRIGGER_RETRIEVE_NAME,
  filter: async (_, params: RetreiveNameEventParams) => {
    if (!params.credential.type || !Array.isArray(params.credential.type)) {
      return false
    }

    return params.credential.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
  },

  method: async (_, { credential, setName }: RetreiveNameEventParams) => {
    const subject = getCompatibleSubject<MembershipSubject>(credential)
    setName(`${subject.role} - ${subject.memberCode}`)
  }
})

export const groupsExtension = buildExtension<RegovGroupExtensionTypes>(groupsExtensionSchema, {
  [REGOV_CREDENTIAL_TYPE_GROUP]: {
    buildingFactory: (credSchema) => async (wallet, params) => {
      const inputData = params.subjectData as GroupSubject
      const updatedSubjectData = {
        ...credSchema.defaultSubject,
        ...inputData,
        createdAt: inputData.createdAt || (new Date).toISOString(),
        uuid: makeRandomUuid()
      }
      if (!updatedSubjectData.name) {
        updatedSubjectData.name = ''
      }
      if (!updatedSubjectData.description) {
        updatedSubjectData.description = ''
      }

      const unsigned = await defaultBuildingFactory(credSchema)(wallet, {
        ...params, subjectData: updatedSubjectData
      })

      return unsigned as unknown as UnsignedCredential
    },

    signingFactory: (credSchema) => async (wallet, params) => {
      if (!params.evidence) {
        const identity = wallet.getIdentity()
        if (identity) {
          params.evidence = identity.credential
        }
      }

      return defaultSigningFactory(credSchema)(wallet, params)
    }
  },
  [REGOV_CREDENTIAL_TYPE_MEMBERSHIP]: {
    buildingFactory: (credSchema) => async (wallet, params) => {
      const inputData = params.subjectData as MembershipSubject
      const updatedSubjectData = {
        ...credSchema.defaultSubject,
        ...inputData,
        createdAt: inputData.createdAt || (new Date).toISOString(),
      }
      if (!updatedSubjectData.groupId) {
        updatedSubjectData.groupId = ''
      }
      if (!updatedSubjectData.role) {
        updatedSubjectData.role = ''
      }
      if (!updatedSubjectData.description) {
        updatedSubjectData.description = ''
      }
      if (!updatedSubjectData.memberCode) {
        updatedSubjectData.memberCode = ''
      }

      const unsigned = await defaultBuildingFactory(credSchema)(wallet, {
        ...params, subjectData: updatedSubjectData
      })

      return unsigned as unknown as UnsignedCredential
    },
  },
  [REGOV_CLAIM_TYPE]: {}
})

groupsExtension.localization = {
  ns: REGOV_EXT_GROUP_NAMESPACE,
  translations: {
  }
}
