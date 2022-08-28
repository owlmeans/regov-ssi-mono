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

import { MaybeArray, normalizeValue } from "../../../common"
import { Credential } from "../../../vc"
import {
  buildWalletLoader, REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER, REGISTRY_TYPE_CLAIMS,
  REGISTRY_TYPE_IDENTITIES, REGISTRY_TYPE_REQUESTS
} from "../../../wallet"
import { ERROR_CANT_IDENTIFY_CREDENTIAL } from "./types"
import {
  EvidenceValidationResult, ValidationErrorCause, ValidateMethodBuilder,
  VALIDATION_KIND_OFFER, VALIDATION_KIND_RESPONSE
} from "../types"
import { CredentialDescription } from "../../schema"


export const defaultValidateMethod: ValidateMethodBuilder = schema =>
  async (wallet, { credential, presentation, extensions, kind }) => {
    let presentationResult: boolean = true
    let presentationCause: undefined | MaybeArray<string | ValidationErrorCause> = undefined
    if (presentation) {
      const [result, info] = await wallet.ssi.verifyPresentation(presentation, undefined, {
        localLoader: buildWalletLoader(wallet),
        testEvidence: true,
        nonStrictEvidence: true
      })

      if (!result) {
        presentationResult = false
        presentationCause = info.kind === 'invalid' ? info.errors : undefined
      } else {
        switch (kind) {
          case VALIDATION_KIND_RESPONSE:
            const request = await wallet.getRegistry(REGISTRY_TYPE_REQUESTS).getCredential(
              presentation.id
            )
            if (!request) {
              presentationResult = false
              presentationCause = 'noRequest'
            }
            break
          case VALIDATION_KIND_OFFER:
            const claim = await wallet.getRegistry(REGISTRY_TYPE_CLAIMS).getCredential(
              presentation.id
            )
            if (!claim) {
              presentationResult = false
              presentationCause = 'noClaim'
            }
            break
        }
      }
    }

    const [result, info] = await wallet.ssi.verifyCredential(credential, undefined, {
      localLoader: buildWalletLoader(wallet),
      nonStrictEvidence: true,
      verifyEvidence: true,
      verifySchema: true
    })

    const evidence = normalizeValue(credential.evidence) as Credential[]
    const evidenceValidation = schema.evidence ? await Promise.all(normalizeValue(schema.evidence).map(
      async (evidenceSchema): Promise<EvidenceValidationResult> => {
        const currentEvidence = evidence.find(evidence => evidence.type.includes(evidenceSchema.type))
        if (!currentEvidence) {
          return {
            type: evidenceSchema.type,
            schema: evidenceSchema,
            instance: currentEvidence,
            result: {
              valid: false,
              cause: 'no-evidence',
              trusted: false,
              evidence: []
            }
          }
        }

        if (!normalizeValue(currentEvidence.type).includes(evidenceSchema.type)) {
          return {
            type: evidenceSchema.type,
            schema: evidenceSchema,
            instance: currentEvidence,
            result: {
              valid: false,
              cause: 'wrong-type-evidence',
              trusted: false,
              evidence: []
            }
          }
        }

        const ext = extensions.getExtension(currentEvidence.type)
        if (!ext.schema.credentials) {
          throw ERROR_CANT_IDENTIFY_CREDENTIAL
        }
        let credInfo: CredentialDescription | undefined = ext.schema.credentials[evidenceSchema.type]
        if (!credInfo) {
          credInfo = Object.entries(ext.schema.credentials).map(([, info]) => info).find(info => {
            return info.mandatoryTypes?.includes(evidenceSchema.type)
          })
        }
        if (!credInfo) {
          throw ERROR_CANT_IDENTIFY_CREDENTIAL
        }

        const factory = ext.getFactory(credInfo.mainType)
        const result = await factory.validate(wallet, {
          credential: currentEvidence, extensions
        })

        return {
          type: credInfo.mainType,
          schema: evidenceSchema,
          instance: currentEvidence,
          result: result,
          trustCredential: normalizeValue(result.evidence).flatMap(
            evidence => normalizeValue(evidence.trustCredential) as []
          )
        }
      })) : []


    if (result && presentationResult) { // && schema.trustable) {
      const identity = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(
        credential.id, REGISTRY_SECTION_PEER
      ) || wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(
        credential.id, REGISTRY_SECTION_OWN
      )

      if (identity) {
        return {
          valid: true,
          trusted: true,
          instance: identity.credential,
          evidence: evidenceValidation
        }
      }
    }

    return {
      valid: result && presentationResult,
      cause: presentationResult
        ? info.kind === 'invalid' ? info.errors : undefined
        : presentationCause,
      trusted: evidenceValidation.length === 0 ? false : evidenceValidation.reduce(
        (trusted, result) => {
          if (trusted) {
            return result.result.trusted && result.result.valid
          }

          return false
        }, true as boolean
      ),
      instance: credential,
      evidence: evidenceValidation
    }
  }