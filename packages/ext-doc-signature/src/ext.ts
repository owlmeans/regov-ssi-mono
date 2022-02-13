import { buildExtension, buildExtensionSchema } from "@owlmeans/regov-ssi-extension"
import { BASIC_IDENTITY_TYPE, RegovSignatureCredential, REGOV_CLAIM_TYPE_SIGNATURE, REGOV_CREDENTIAL_TYPE_SIGNATURE, REGOV_EXT_SIGNATURE_NAMESPACE } from "./types"
import { REGISTRY_TYPE_CREDENTIALS } from "@owlmeans/regov-ssi-core"


let signatureExtensionSchema = buildExtensionSchema<RegovSignatureCredential>({
  name: 'extension.details.name',
  code: 'owlmean-regov-doc-signature',
  types: {
    claim: REGOV_CLAIM_TYPE_SIGNATURE
  }
}, {
  [REGOV_CREDENTIAL_TYPE_SIGNATURE]: {
    mainType: REGOV_CREDENTIAL_TYPE_SIGNATURE,
    defaultNameKey: 'cred.signature.name',
    credentialContext: {
      '@version': 1.1,
      name: "http://www.w3.org/2001/XMLSchema#string",
      description: "http://www.w3.org/2001/XMLSchema#string",
      documentHash: "http://www.w3.org/2001/XMLSchema#string",
      type: "http://www.w3.org/2001/XMLSchema#string",
      filename: "http://www.w3.org/2001/XMLSchema#string",
      url: "http://www.w3.org/2001/XMLSchema#string",
      creationDate: "http://www.w3.org/2001/XMLSchema#datetime",
      version: "http://www.w3.org/2001/XMLSchema#string",
      author: "http://www.w3.org/2001/XMLSchema#string",
      authorId: "http://www.w3.org/2001/XMLSchema#string",
      signedAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: {
      type: BASIC_IDENTITY_TYPE,
      signing: true,
    },
    registryType: REGISTRY_TYPE_CREDENTIALS,
    selfIssuing: true,
    claimable: false,
    listed: true,
  }
})

export const signatureExtension = buildExtension<RegovSignatureCredential>(
  signatureExtensionSchema, {
  [REGOV_CREDENTIAL_TYPE_SIGNATURE]: {}
})

signatureExtension.localization = {
  ns: REGOV_EXT_SIGNATURE_NAMESPACE,
  translations: {
  }
}
