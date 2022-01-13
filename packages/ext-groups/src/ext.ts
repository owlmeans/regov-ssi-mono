import {
  buildExtension,
  buildExtensionSchema
} from "@owlmeans/regov-ssi-extension"
import {
  REGISTRY_TYPE_IDENTITIES,
  REGISTRY_TYPE_CREDENTIALS
} from '@owlmeans/regov-ssi-core'
import {
  BASIC_IDENTITY_TYPE,
  RegovGroupExtensionTypes,
  REGOV_CREDENTIAL_TYPE_GROUP,
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP
} from "./types"


export const groupsExtensionSchema = buildExtensionSchema<RegovGroupExtensionTypes>({
  name: 'extension.details.name',
  code: 'owlmean-regov-groups'
}, {
  [REGOV_CREDENTIAL_TYPE_GROUP]: {
    mainType: REGOV_CREDENTIAL_TYPE_GROUP,
    mandatoryTypes: [BASIC_IDENTITY_TYPE, REGOV_CREDENTIAL_TYPE_GROUP],
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
    mandatoryTypes: [BASIC_IDENTITY_TYPE, REGOV_CREDENTIAL_TYPE_MEMBERSHIP],
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

export const groupsExtension = buildExtension<RegovGroupExtensionTypes>(groupsExtensionSchema)

groupsExtension.localization = {
  ns: 'owlmeans-regov-ext-groups',
  translations: {
  }
}
