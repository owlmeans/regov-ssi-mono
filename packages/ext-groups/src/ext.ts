/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  addObserverToSchema, addToValue, buildExtension, buildExtensionSchema, CredentialType, defaultBuildMethod, defaultSignMethod,
  defaultValidateMethod, DIDDocument, DIDPURPOSE_VERIFICATION, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, EXTENSION_TRIGGER_RETRIEVE_NAME,
  IncommigDocumentEventParams, MaybeArray, RetreiveNameEventParams, VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-core"
import {
  REGISTRY_TYPE_IDENTITIES, REGISTRY_TYPE_CREDENTIALS, UnsignedCredential, getCompatibleSubject,
  isPresentation
} from '@owlmeans/regov-ssi-core'
import {
  BASIC_IDENTITY_TYPE, ChainedType, GroupBuildMethodParams, GroupSubject, MembershipSubject, 
  REGOV_CREDENTIAL_TYPE_GROUP, REGOV_CREDENTIAL_TYPE_MEMBERSHIP, REGOV_EXT_GROUP_NAMESPACE,
  REGOV_GROUP_CHAINED_TYPE, RegovGroupExtensionTypes, REGOV_CLAIM_TYPE, REGOV_GROUP_CLAIM_TYPE,
  REGOV_GROUP_LIMITED_TYPE, REGOV_GROUP_ROOT_TYPE, REGOV_OFFER_TYPE
} from "./types"
import { makeRandomUuid, normalizeValue } from "@owlmeans/regov-ssi-core"
import { localization } from "./i18n"


let groupsExtensionSchema = buildExtensionSchema<RegovGroupExtensionTypes>({
  name: 'extension.details.name',
  code: 'owlmeans-regov-groups',
  types: {
    claim: REGOV_CLAIM_TYPE
  }
}, {
  [REGOV_CREDENTIAL_TYPE_GROUP]: {
    mainType: REGOV_CREDENTIAL_TYPE_GROUP,
    defaultNameKey: 'cred.group.name',
    contextUrl: 'https://owlmeans.com/schema/group',
    credentialContext: {
      '@version': 1.1,
      uuid: "http://www.w3.org/2001/XMLSchema#string",
      name: "http://www.w3.org/2001/XMLSchema#string",
      description: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
      depth: "http://www.w3.org/2001/XMLSchema#integer"
    },
    evidence: {
      type: BASIC_IDENTITY_TYPE,
      signing: true,
    },
    claimType: REGOV_GROUP_CLAIM_TYPE,
    registryType: REGISTRY_TYPE_CREDENTIALS,
    selfIssuing: true,
    claimable: true,
    listed: true,
  },
  [REGOV_CREDENTIAL_TYPE_MEMBERSHIP]: {
    mainType: REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
    mandatoryTypes: [BASIC_IDENTITY_TYPE],
    defaultNameKey: 'cred.membership.name',
    contextUrl: 'https://owlmeans.com/schema/group-membership',
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

export const groupsExtension = buildExtension(groupsExtensionSchema, {
  [REGOV_CREDENTIAL_TYPE_GROUP]: {
    produceBuildMethod: (credSchema) => async (wallet, params: GroupBuildMethodParams) => {
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

      const unsigned = await defaultBuildMethod(credSchema)(wallet, {
        ...params, subjectData: updatedSubjectData
      })

      let type: MaybeArray<ChainedType> = []
      let depth: number | undefined

      switch (params.chainedType) {
        case REGOV_GROUP_ROOT_TYPE:
          depth = params.depth
          type = [REGOV_GROUP_ROOT_TYPE, REGOV_GROUP_CHAINED_TYPE]
          break
        case REGOV_GROUP_CHAINED_TYPE:
          type = [REGOV_GROUP_CHAINED_TYPE]
          depth = params.depth
          if (!depth) {
            type.push(REGOV_GROUP_LIMITED_TYPE)
          }
          break
        case REGOV_GROUP_LIMITED_TYPE:
          type = [REGOV_GROUP_LIMITED_TYPE, REGOV_GROUP_CHAINED_TYPE]
          break
      }

      unsigned.type = addToValue(unsigned.type, type) as CredentialType

      if (depth) {
        unsigned.credentialSubject.depth = depth
      }

      return unsigned as unknown as UnsignedCredential
    },
    produceSignMethod: (credSchema) => async (wallet, params) => {
      if (!params.evidence) {
        const identity = wallet.getIdentity()
        if (identity) {
          params.evidence = identity.credential
        }
      }

      return defaultSignMethod(credSchema)(wallet, params)
    },
    produceValidateMethod: credSchema => async (wallet, params) => {
      const result = await defaultValidateMethod(credSchema)(wallet, params)

      const membershipEvidence = normalizeValue(result.evidence).find(
        evidence => evidence.instance?.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
      )
    
      if (params.credential.type.includes(REGOV_GROUP_ROOT_TYPE)) {
        if (membershipEvidence) {
          result.valid = false
          result.cause = 'rootShouldBeSelfSigned'
        } else if (!params.credential.type.includes(REGOV_GROUP_CHAINED_TYPE)) {
          result.valid = false
          result.cause = 'wrongGroupType'
        }
      } else if (params.credential.type.includes(REGOV_GROUP_CHAINED_TYPE)) {
        const issuer = normalizeValue(membershipEvidence?.result.evidence).find(
          evidence => evidence?.instance?.type.includes(BASIC_IDENTITY_TYPE)
        )
        const group = normalizeValue(membershipEvidence?.result.evidence).find(
          evidence => evidence?.instance?.type.includes(REGOV_GROUP_CHAINED_TYPE)
        )
        const issuerDID = issuer?.instance?.issuer as DIDDocument
        const groupDID = group?.instance?.issuer as DIDDocument
        const issuerMethod = wallet.did.helper().expandVerificationMethod(
          issuerDID, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
        )
        const groupMethod = wallet.did.helper().expandVerificationMethod(
          groupDID, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
        )
        const credDepth = (params.credential.credentialSubject as GroupSubject).depth || 0
        const groupDepth = (group?.instance?.credentialSubject as GroupSubject).depth || 0
        if (issuerMethod.publicKeyBase58 !== groupMethod.publicKeyBase58) {
          result.valid = false
          result.cause = 'notAuthorizedIssuer'
        } else if (credDepth < 0 || credDepth >= groupDepth) {
          result.valid = false
          result.cause = 'wrongDepth'
        } if (credDepth < 0 || group?.instance?.type.includes(REGOV_GROUP_LIMITED_TYPE)) {
          result.valid = false
          result.cause = 'terminationFailure'
        }
      } else {
        const issuer = normalizeValue(membershipEvidence?.result.evidence).find(
          evidence => evidence?.instance?.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
        )
        if (issuer) {
          result.valid = false
          result.cause = 'ordinaryGroupIssuedByMember'
        } else if (params.credential.type.includes(REGOV_GROUP_LIMITED_TYPE)) {
          result.valid = false
          result.cause = 'wrongGroupType'
        }
      }

      return result
    }
  },
  [REGOV_CREDENTIAL_TYPE_MEMBERSHIP]: {
    produceBuildMethod: (credSchema) => async (wallet, params) => {
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

      const unsigned = await defaultBuildMethod(credSchema)(wallet, {
        ...params, subjectData: updatedSubjectData
      })

      return unsigned as unknown as UnsignedCredential
    },
    produceValidateMethod: credSchema => async (wallet, params) => {
      const result = await defaultValidateMethod(credSchema)(wallet, params)

      const groupEvidence = normalizeValue(result.evidence).find(
        evidence => evidence.instance?.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
      )

      const identityEvidence = normalizeValue(result.evidence).find(
        evidence => evidence.instance?.type.includes(BASIC_IDENTITY_TYPE)
      )

      if (identityEvidence?.result.valid && groupEvidence?.result.trusted && groupEvidence?.result.valid) {
        identityEvidence.result.trusted = true
        result.trusted = true
      }

      return result
    }
  },
  [REGOV_CLAIM_TYPE]: {}
})

groupsExtension.localization = {
  ns: REGOV_EXT_GROUP_NAMESPACE,
  translations: localization
}
