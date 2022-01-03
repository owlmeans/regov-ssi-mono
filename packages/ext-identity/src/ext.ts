import {
  addObserverToSchema,
  buildExtension,
  buildExtensionSchema,
  ExtensionDetails,
  EXTESNION_TRIGGER_AUTHENTICATED
} from "@owlmeans/regov-ssi-extension"
import {
  WalletWrapper,
  REGISTRY_TYPE_IDENTITIES
} from "@owlmeans/regov-ssi-core"


export const BASIC_IDENTITY_TYPE = 'Identity'

export const buildIdentityExtension = (type: string, details: ExtensionDetails) => {
  const REGOV_IDENTITY_TYPE = type || 'OwlMeans:Regov:Identity'
  const FLOW_ONBOARDING = `_Flow:${REGOV_IDENTITY_TYPE}:Onboarding`

  type IdentityCredentials = typeof REGOV_IDENTITY_TYPE
  type IdentityFlows = typeof FLOW_ONBOARDING

  let schema = buildExtensionSchema<IdentityCredentials, IdentityFlows>(details, {
    [REGOV_IDENTITY_TYPE]: {
      mainType: REGOV_IDENTITY_TYPE,
      mandatoryTypes: [REGOV_IDENTITY_TYPE, BASIC_IDENTITY_TYPE],
      defaultNameKey: 'cred.type.identity.name',
      credentialContext: {
        '@version': 1.1,
        identifier: "http://www.w3.org/2001/XMLSchema#string",
        sourceApp: "http://www.w3.org/2001/XMLSchema#string",
        uuid: "http://www.w3.org/2001/XMLSchema#string",
        createdAt: "http://www.w3.org/2001/XMLSchema#datetime"
      },
      /**
       * @TODO Load from file. Should be a valid credential
       * with a subject that describe the way that the tested
       * credential subject should be verified.
       */
      // credentialSchema: {}
      registryType: REGISTRY_TYPE_IDENTITIES,
      claimable: false,
      listed: true,
      selfIssuing: true,
    }
  }, {
    [FLOW_ONBOARDING]: {
      initialStep: { widget: 'onboarding.welcom', next: 'final' },
      steps: {
        final: { widget: 'onboarding.create', next: 'congrat' },
        congrat: { widget: 'onboarding.congrat' }
      }
    }
  })

  schema = addObserverToSchema<IdentityCredentials, IdentityFlows>(schema, {
    filter: async (_: WalletWrapper) => {
      return true
    },
    trigger: EXTESNION_TRIGGER_AUTHENTICATED,
    flow: FLOW_ONBOARDING
  })

  return buildExtension<IdentityCredentials>(schema)
}