import { normalizeValue } from "@owlmeans/regov-ssi-common"
import { buildWalletLoader, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES } from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
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
        if (!evidence[index]) {
          return {
            type: evidenceSchema.type,
            result: {
              valid: false,
              cause: 'no-evidence',
              trusted: false,
              evidence: []
            }
          }
        }

        const ext = extensions.getExtension(evidenceSchema.type)

        if (!ext.schema.credentials) {
          throw ERROR_CANT_IDENTIFY_CREDENTIAL
        }
        let credInfo: CredentialDescription | undefined = ext.schema.credentials[evidenceSchema.type]
        if (!credInfo) {
          credInfo = Object.entries(ext.schema.credentials).map(([key, info]) => info).find(info => {
            return info.mandatoryTypes?.includes(evidenceSchema.type)
          })
        }
        if (!credInfo) {
          throw ERROR_CANT_IDENTIFY_CREDENTIAL
        }
        const factory = ext.getFactory(credInfo.mainType)
        const result = await factory.validationFactory(wallet, { credential, extensions })

        return {
          type: evidenceSchema.type,
          result: result,
          trustCredential: normalizeValue(result.evidence).flatMap(
            evidence => normalizeValue(evidence.trustCredential) as []
          )
        }
      })) : []

    if (result && schema.trustable) {
      const identity = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential(
        (credential.issuer as unknown as DIDDocument).id, REGISTRY_SECTION_PEER
      )

      if (identity) {
        return {
          valid: true,
          trusted: true,
          evidence: evidenceValidation
        }
      }
    }

    return {
      valid: result,
      cause: info.kind === 'invalid' ? info.errors : undefined,
      trusted: evidenceValidation.length === 0 ? false : evidenceValidation.reduce((trusted, result) => {
        if (trusted) {
          return result.result.trusted && result.result.valid
        }

        return false
      }, true as boolean),
      evidence: evidenceValidation
    }
  }