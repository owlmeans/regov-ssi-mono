import {
  DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION,
  REGISTRY_TYPE_IDENTITIES, VERIFICATION_KEY_HOLDER, WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { commDidHelperBuilder } from "../did"


export const fillWallet = async (wallet: WalletWrapper) => {
  const subject = {
    data: {
      '@type': 'TestCredentialSubjectDataType',
      worker: 'Valentin Michalych'
    }
  }
  const key = await wallet.ssi.keys.getCryptoKey()
  const didUnsigned = await wallet.ssi.did.helper().createDID(
    key,
    {
      data: JSON.stringify(subject),
      hash: true,
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
    }
  )

  const _didHelper = commDidHelperBuilder(wallet)

  const did = await wallet.ssi.did.helper().signDID(key, await _didHelper.addDIDAgreement(didUnsigned))

  const unsingnedCredentail = await wallet.ssi.buildCredential({
    id: did.id,
    type: ['VerifiableCredential', 'TestCredential'],
    holder: did,
    context: {
      '@version': 1.1,
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      exam: 'https://example.org/vc-schema#',
      data: {
        '@id': 'exam:data',
        '@type': '@id',
        '@context': {
          worker: { '@id': 'exam:worker', '@type': 'xsd:string' }
        }
      }
    },
    subject
  })

  const credentail = await wallet.ssi.signCredential(
    unsingnedCredentail, did, { keyId: VERIFICATION_KEY_HOLDER }
  )

  await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(credentail)
  wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).registry.rootCredential = credentail.id
}