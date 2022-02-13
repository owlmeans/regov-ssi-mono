
require('dotenv').config()


import { 
  buildVCV1, 
  buildVCV1Skeleton, 
  buildVCV1Unsigned, 
  validateVCV1 
} from '@affinidi/vc-common'
import { 
  COMMON_CRYPTO_ERROR_NOPUBKEY, 
  nodeCryptoHelper 
} from '@owlmeans/regov-ssi-common'
import { 
  buildDidHelper, 
  buildDidRegistryWarpper, 
  buildDocumentLoader, 
  DIDPURPOSE_ASSERTION, 
  DIDPURPOSE_AUTHENTICATION, 
  DIDPURPOSE_VERIFICATION, 
  DID_REGISTRY_ERROR_NO_DID, 
  VERIFICATION_KEY_HOLDER 
} from '@owlmeans/regov-ssi-did'
import util from 'util'
import { 
  buildKeyChain, 
  buildSSICore 
} from '..'

const jsigs = require('jsonld-signatures')

util.inspect.defaultOptions.depth = 8



  ; (async () => {

    const ssi = await buildSSICore({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const subject = {
      worker: 'Valentin Michalych'
    }

    const key = await ssi.keys.getCryptoKey()
    const didUnsigned = await ssi.did.helper().createDID(
      key,
      {
        data: JSON.stringify(subject),
        hash: true,
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
      }
    )

      ; (didUnsigned as any)['@context'].splice(1, 1, {
        '@version': 1.1,
        didx: 'https://example.org/did-schema#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        nonce: { '@id': 'didx:nonce', '@type': 'xsd:string' },
        publicKeyBase58: { '@id': 'didx:publicKeyBase58', '@type': 'xsd:string' }
      })
    const did = await ssi.did.helper().signDID(key, didUnsigned)

    console.log(did)

    const skeleton = buildVCV1Skeleton({
      context: {
        '@version': 1.1,
        exam: 'https://example.org/vc-schema#',
        worker: { '@id': 'exam:worker', '@type': 'xsd:string' }
      },
      id: did.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: did,
      credentialSubject: subject as any,
    })

    const unsignedC = await buildVCV1Unsigned({
      skeleton,
      issuanceDate: (new Date).toISOString()
    })

    console.log(unsignedC)

    const documentLoader = buildDocumentLoader(ssi.did)(() => did);

    const signed = await buildVCV1({
      unsigned: unsignedC,
      issuer: {
        did: did as any,
        keyId: VERIFICATION_KEY_HOLDER,
        privateKey: key.pk as string,
        publicKey: key.pubKey
      },
      getSignSuite: (options) => {
        return nodeCryptoHelper.buildSignSuite({
          publicKey: <string>options.publicKey,
          privateKey: options.privateKey,
          id: `${(options.controller as any).id}#${options.keyId}`,
          controller: options.controller
        }) as any
      },
      documentLoader,
      getProofPurposeOptions: undefined
    })

    const getVerifySuite = (options: any) => {
      if (!key.pubKey) {
        throw new Error(COMMON_CRYPTO_ERROR_NOPUBKEY)
      }
      if (typeof did !== 'object') {
        throw new Error(DID_REGISTRY_ERROR_NO_DID)
      }

      return nodeCryptoHelper.buildSignSuite({
        publicKey: key.pubKey,
        privateKey: '',
        controller: did.id,
        id: options.verificationMethod
      })
    }

    const { AssertionProofPurpose } = jsigs.purposes

    const res = await jsigs.verify(signed, {
      suite: await getVerifySuite({
        verificationMethod: signed.proof.verificationMethod,
        controller: signed.issuer,
        proofType: signed.proof.type,
      }),
      documentLoader,
      purpose: new AssertionProofPurpose({}),
      compactProof: false,
    })

    console.log(res)
  })()