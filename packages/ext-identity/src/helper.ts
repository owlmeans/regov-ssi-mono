import {
  UnsignedCredential,
  Credential,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"


export const credIdToIdentityId = (wallet: WalletWrapper, cred: UnsignedCredential | Credential) => {
  const id = wallet.did.helper().parseDIDId(cred.id).id
  const source = wallet.ssi.crypto.hash(id).substring(0, 24)
  
  return `${source.substring(0, 8)}-${source.substring(8, 16)}-${source.substring(16, 24)}`.toUpperCase()
}