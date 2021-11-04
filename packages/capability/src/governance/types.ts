import {
  Credential
} from '@owlmeans/regov-ssi-core'

import {
  Capability
} from "../credential/types"


export const GOVERNANCE_CAPABILITY_TYPE = 'GovernanceCapability'

export const isGovernance = (credential: Credential): credential is Capability => {
  return credential.type.includes(GOVERNANCE_CAPABILITY_TYPE)
}