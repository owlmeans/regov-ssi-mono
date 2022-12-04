import {
  CredentialDescription, Extension, ExtensionSchema, MultiSchema, buildExtension
} from "@owlmeans/regov-ssi-core"
import { CustomDescription, isCustom } from "../custom.types"
import { castClaimType, castOfferType, castRequestType, castResponseType } from "./tools"


export const addCredential = (schema: ExtensionSchema, cred: Omit<CustomDescription, "customExtFlag">): ExtensionSchema => {
  return {
    ...schema,
    credentials: {
      ...schema.credentials,
      ...productTypes(schema, { ...cred, customExtFlag: true })
    }
  }
}

export const updateFactories = (ext: Extension): Extension => {
  ext.factories = {
    ...ext.factories,
    ...buildExtension(ext.schema, (ext.schema.credentials ? Object.fromEntries(
      Object.entries(ext.schema.credentials).flatMap(
        ([type, descr]) => isCustom(descr) ? [
          [type, {}],
          [castClaimType(descr), {}],
          [castOfferType(descr), {}],
          [castRequestType(descr), {}],
          [castResponseType(descr), {}]
        ] : []
      )
    ) : {})).factories
  }

  return ext
}

const productTypes = (schema: ExtensionSchema, cred: CustomDescription): { [key: string]: CredentialDescription } => {
  const claimType = castClaimType(cred)
  const offerType = castOfferType(cred)
  const requestType = castRequestType(cred)
  const responseType = castResponseType(cred)

  return {
    [cred.mainType]: expandType(schema, cred),
    [claimType]: expandType(schema, { mainType: claimType, credentialContext: {} }),
    [offerType]: expandType(schema, { mainType: offerType, credentialContext: {} }),
    [requestType]: expandType(schema, { mainType: requestType, credentialContext: {} }),
    [responseType]: expandType(schema, { mainType: responseType, credentialContext: {} }),
  }
}

const expandType = (
  schema: ExtensionSchema, cred: CustomDescription<Record<string, any>> | CredentialDescription
): CredentialDescription => {
  return {
    ...(schema.credentials && schema.credentials[cred.mainType] || {}),
    ...cred, credentialContext: {
      ...cred.credentialContext,
      ...(isCustom<Record<string, any>>(cred) ? Object.fromEntries(
        Object.entries(cred.subjectMeta).filter(([, field]) => field.term).map(
          ([key, field]) => [key, field.term]
        )
      ) as MultiSchema : {})
    },
  }
}