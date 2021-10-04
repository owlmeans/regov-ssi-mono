
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
  ...doubleDidShape,
  capabilityInvocation: [
    expect.any(String)
  ],
  capabilityDelegation: [
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