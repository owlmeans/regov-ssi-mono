import { BuildDocumentLoader, DIDDocument, DIDDocumentUnsinged } from "./types"
import { DIDRegistryWrapper } from "./types/registry"

export const buildDocumentLoader = (did: DIDRegistryWrapper): BuildDocumentLoader =>
  (fallback?) => async (url) => {
    if (url.startsWith('did:')) {
      return {
        contextUrl: null,
        document: (
          did =>
            JSON.parse(JSON.stringify(
              did || (fallback ? fallback() : {})
            ))
        )(await did.lookUpDid(url)),
        documentUrl: url,
      }
    }

    return require('jsonld').documentLoader(url)
  }