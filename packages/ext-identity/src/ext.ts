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
  const identityType = type || 'OwlMeans:Regov:Identity'
  const onboardingFlow = `_Flow:${identityType}:Onboarding`

  type IdentityCredentials = typeof identityType
  type IdentityFlows = typeof onboardingFlow

  let schema = buildExtensionSchema<IdentityCredentials, IdentityFlows>(details, {
    [identityType]: {
      mainType: identityType,
      mandatoryTypes: [identityType, BASIC_IDENTITY_TYPE],
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
    [onboardingFlow]: {
      code: onboardingFlow,
      initialStep: 'welcome',
      steps: {
        welcome:  { stateMethod: 'onboarding.welcom', next: 'create' },
        create: { stateMethod: 'onboarding.create', next: 'congrat' },
        congrat: { stateMethod: 'onboarding.congrat' }
      }
    }
  })

  schema = addObserverToSchema<IdentityCredentials, IdentityFlows>(schema, {
    filter: async (_: WalletWrapper) => {
      return true
    },
    trigger: EXTESNION_TRIGGER_AUTHENTICATED,
    flow: onboardingFlow
  })

  return buildExtension<IdentityCredentials, string>(schema)
}