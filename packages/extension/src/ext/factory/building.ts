import { WalletWrapper } from "@owlmeans/regov-ssi-core"
import {
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
} from "@owlmeans/regov-ssi-did"
import { CredentialSchema } from "../../schema"
import { BuildingFactoryParams } from "../types"


export const defaultBuildingFactory = <
  Evidance extends {} = any, Schema extends {} = any,
  >(schema: CredentialSchema<Evidance, Schema>) =>
  async (wallet: WalletWrapper, params: BuildingFactoryParams) => {

    const subject = {
      data: { '@type': schema.mainType, ...params.subjectData }
    }

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
      type: [
        'VerifiableCredential',
        schema.mainType,
        ...(Array.isArray(schema.mandatoryTypes) ? schema.mandatoryTypes : [])
      ],
      holder: didUnsigned.id,
      context: schema.credentialContext,
      subject
    })

    return { unsigned: unsingnedCredentail, did: didUnsigned }
  }