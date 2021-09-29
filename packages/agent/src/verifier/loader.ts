import {
  LocalDocumentLoader,
  WalletWrapper
} from "@owlmeans/regov-ssi-core";
import { CREDENTIAL_SATELLITE_TYPE, SatelliteCredential } from "../holder/types";
import { identityHelper } from "../identity/identity";


export const buildLocalLoader: (
  wallet: WalletWrapper
) =>
  LocalDocumentLoader
  = (wallet) => (
    didHelper,
    loaderBuilder,
    presentation,
    didDoc?
  ) => async (url) => {
    const loader = loaderBuilder(() => {
      if (didHelper.isDIDId(url)) {
        const urlId = didHelper.parseDIDId(url).did

        const creds = [...presentation.verifiableCredential]
        const entity = identityHelper(wallet).extractEntity(creds)
        const entityId = entity?.credentialSubject.did.id
        if (entity && entityId && didHelper.parseDIDId(entityId).did === urlId) {
          return entity.credentialSubject.did
        }
        const satellites = creds?.filter((cred) => cred.type.includes(CREDENTIAL_SATELLITE_TYPE))
        const satellite = satellites?.find(satellite => satellite.id === urlId) as SatelliteCredential
        if (satellite) {
          return satellite.credentialSubject.data.did
        }

        return didDoc
      }
    })

    return loader(url)
  }