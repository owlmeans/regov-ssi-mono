import {
  buildExtension,
  buildExtensionSchema
} from "@owlmeans/regov-ssi-extension"
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
    credentialContext: {
      '@version': 1.1,
    }
  },
  [REGOV_CREDENTIAL_TYPE_MEMBERSHIP]: {
    mainType: REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
    mandatoryTypes: [BASIC_IDENTITY_TYPE, REGOV_CREDENTIAL_TYPE_MEMBERSHIP],
    credentialContext: {
      '@version': 1.1,
    }
  }
})

export const groupsExtension = buildExtension<RegovGroupExtensionTypes>(groupsExtensionSchema)
