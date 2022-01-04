import {
  WalletWrapper,
  CredentialSchema,
  BASE_CREDENTIAL_TYPE
} from "@owlmeans/regov-ssi-core"
import {
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
} from "@owlmeans/regov-ssi-did"
import { CredentialDescription } from "../../schema"
import { BuildingFactoryParams } from "../types"


export const defaultBuildingFactory = <
  Schema extends CredentialSchema = CredentialSchema,
  >(schema: CredentialDescription<Schema>) =>
  async (wallet: WalletWrapper, params: BuildingFactoryParams) => {

    const subject = params.subjectData as any

    const key = params.key || await wallet.ssi.keys.getCryptoKey()
    const didUnsigned = params.didUnsigned || await wallet.ssi.did.helper().createDID(
      key,
      {
        data: JSON.stringify(subject),
        hash: true,
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
      }
    )

    const unsingnedCredentail = await wallet.ssi.buildCredential({
      id: didUnsigned.id,
      type: params.type || [
        BASE_CREDENTIAL_TYPE,
        schema.mainType,
        ...(Array.isArray(schema.mandatoryTypes) ? schema.mandatoryTypes : [])
      ],
      holder: didUnsigned,
      context: schema.credentialContext,
      subject
    })

    if (params.schema) {
      unsingnedCredentail.credentialSchema = params.schema
    } else if (schema.credentialSchema) {
      unsingnedCredentail.credentialSchema = schema.credentialSchema
    }

    if (params.evidence) {
      unsingnedCredentail.evidence = params.evidence
    }

    return unsingnedCredentail
  }