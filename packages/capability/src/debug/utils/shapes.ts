
import {
  credentialShape,
  didShape,
  doubleDidShape
} from '@owlmeans/regov-ssi-agent/src/debug/utils/shapes'


export const governanceSubject = {
  source: didShape
}

export const capabilitySubject = {
  ...governanceSubject,
  root: expect.any(String)
}

export const govrnanceShape = {
  ...credentialShape,
  credentialSubject: {
    ...governanceSubject
  }
}

export const capabilityShape = {
  ...credentialShape,
  credentialSubject: {
    ...capabilitySubject
  }
}

export const capabilityDid = {
  ...(did => {
    const _did = {...did}
    delete (<any>_did).authentication
    
    return _did
  })(doubleDidShape),
  capabilityInvocation: [
    expect.any(String)
  ],
  capabilityDelegation: [
    expect.any(String)
  ]
}

export const capabilitySatelliteShape = {
  ...credentialShape,
  credentialSubject: {
    data: {
      did: (did => {
        const _did = {...did}
        delete (<any>_did).keyAgreement
        delete (<any>_did).assertionMethod
        delete (<any>_did).authentication
        
        return _did
      })(didShape)
    }
  }
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