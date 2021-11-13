
import {
  credentialShape,
  didShape,
  doubleDidShape
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

export const entityShape = {
  ...credentialShape,
  credentialSubject: {
    data: {
      identity: credentialShape
    },
    did: didShape
  }
}