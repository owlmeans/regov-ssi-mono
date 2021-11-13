
import {
  credentialShape,
  didShape,
  doubleDidShape,
  proofShape
} from '@owlmeans/regov-ssi-agent/src/debug/utils/shapes'


export const organizationDid = {
  ...(did => {
    const _did = {...did};
    // delete (<any>_did).authentication;

    ((<any>_did).verificationMethod as Array<unknown>).splice(0, 1)
    
    return _did
  })(doubleDidShape),
  capabilityInvocation: [
    expect.any(String)
  ]
}

export const capabilityDid = {
  ...(did => {
    const _did = {...did}
    delete (<any>_did).authentication
    
    return _did
  })(doubleDidShape),
  capabilityInvocation: [
    expect.any(String)
  ]
}

export const capaiblityDoubleDid = {
  assertionMethod: [
    expect.any(String),
    expect.any(String),
  ],
  authentication: [
    expect.any(String),
  ],
  capabilityInvocation: [
    expect.any(String),
  ],
  id: expect.any(String),
  verificationMethod: [
    {
      controller: expect.any(String),
      id: expect.any(String),
      nonce: expect.any(String),
      publicKeyBase58: expect.any(String),
    },
    {
      controller: expect.any(String),
      id: expect.any(String),
      nonce: expect.any(String),
      publicKeyBase58: expect.any(String),
    }
  ],
  proof: proofShape
}

export const entityShape = {
  ...credentialShape,
  credentialSubject: {
    data: {
      identity: credentialShape
    },
    did: didShape
  }
}

export const orgCapaiblityShape = {
  ...credentialShape,
  credentialSubject: {
    source: {
      ...credentialShape,
      credentialSubject: {
        source: credentialShape,
        sourceDid: didShape
      }
    },
    sourceDid: organizationDid
  }
}

export const membershipCapabilityShape = {
  ...credentialShape,
  credentialSubject: {
    data: {
      defaults: {
        organziationDid: expect.any(String)
      }
    },
    source: orgCapaiblityShape,
    sourceDid: capaiblityDoubleDid
  }
}