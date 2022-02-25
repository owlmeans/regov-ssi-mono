import { normalizeValue } from "@owlmeans/regov-ssi-common"
import {
  buildWalletLoader, Credential, REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES
} from "@owlmeans/regov-ssi-core"
import { ERROR_CANT_IDENTIFY_CREDENTIAL } from "./types"
import { EvidenceValidationResult, ValidationFactoryMethodBuilder } from "../types"
import { CredentialDescription } from "../../schema"


export const defaultValidationFactory: ValidationFactoryMethodBuilder = schema =>
  async (wallet, { credential, extensions }) => {
    const [result, info] = await wallet.ssi.verifyCredential(credential, undefined, {
      localLoader: buildWalletLoader(wallet),
      nonStrictEvidence: true,
      verifyEvidence: true,
      verifySchema: true
    })

    const evidence = normalizeValue(credential.evidence)
    const evidenceValidation = schema.evidence ? await Promise.all(normalizeValue(schema.evidence).map(
      async (evidenceSchema, index): Promise<EvidenceValidationResult> => {
        const currentEvidence = evidence[index] as Credential
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
        const result = await factory.validationFactory(wallet, {
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


    if (result) { // && schema.trustable) {
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
      valid: result,
      cause: info.kind === 'invalid' ? info.errors : undefined,
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