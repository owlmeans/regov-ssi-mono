import { 
  buildWalletLoader, Credential, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES, WalletWrapper 
} from "@owlmeans/regov-ssi-core"
import { ERROR_NO_PEER_VCS, ServerAppConfig } from "./types"
import fs from 'fs'


export const readPeerVCs = async (wallet: WalletWrapper, config: ServerAppConfig) => {
  await new Promise(async (resolve, reject) => {
    if (!config.peerVCs) {
      reject(ERROR_NO_PEER_VCS)
      return
    }
    fs.readdir(config.peerVCs, async (err, files) => {
      if (err) {
        reject(err)
        return
      }

      await Promise.all(files.map(async file => {
        return new Promise((resolve, reject) => {
          fs.readFile(config.peerVCs + '/' + file, async (err, data) => {
            if (err) {
              reject(err)
              return
            }

            try {
              const vc: Credential = JSON.parse(data.toString('utf8'))
              const [result, err] = await wallet.ssi.verifyCredential(vc, undefined, {
                localLoader: buildWalletLoader(wallet),
                verifyEvidence: true,
                verifySchema: true,
                nonStrictEvidence: true
              })
              if (!result) {
                throw err
              }
              const registry = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
              if (registry.getCredential(vc.id)) {
                throw ERROR_VC_EXISTS
              }
              await registry.addCredential(vc, REGISTRY_SECTION_PEER)
            } catch (e) {
              console.error(e)
            } finally {
              resolve(undefined)
            }
          })
        })
      }))

      resolve(undefined)
    })
  })
}

const ERROR_VC_EXISTS = 'ERROR_VC_EXISTS'