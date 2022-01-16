import {
  addObserverToSchema,
  buildExtension,
  buildExtensionSchema,
  defaultBuildingFactory,
  defaultSigningFactory,
  EXTESNION_TRIGGER_INCOMMING_DOC_RECEIVED,
  IncommigDocumentEventParams
} from "@owlmeans/regov-ssi-extension"
import {
  REGISTRY_TYPE_IDENTITIES,
  REGISTRY_TYPE_CREDENTIALS,
  UnsignedCredential
} from '@owlmeans/regov-ssi-core'
import {
  BASIC_IDENTITY_TYPE,
  GroupSubject,
  RegovGroupExtensionTypes,
  REGOV_CREDENTIAL_TYPE_GROUP,
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP
} from "./types"
import { makeRandomUuid } from "@owlmeans/regov-ssi-common"


let groupsExtensionSchema = buildExtensionSchema<RegovGroupExtensionTypes>({
  name: 'extension.details.name',
  code: 'owlmean-regov-groups'
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
    evidence: {
      type: REGOV_CREDENTIAL_TYPE_GROUP
    }
  }
})

groupsExtensionSchema = addObserverToSchema(groupsExtensionSchema, {
  trigger: EXTESNION_TRIGGER_INCOMMING_DOC_RECEIVED,
  filter: async (_, params: IncommigDocumentEventParams<RegovGroupExtensionTypes>) => {
    if (!params.credential.type || !Array.isArray(params.credential.type)) {
      return false
    }

    return params.credential.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
  },
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
  [REGOV_CREDENTIAL_TYPE_MEMBERSHIP]: {}
})

groupsExtension.localization = {
  ns: 'owlmeans-regov-ext-groups',
  translations: {
  }
}
