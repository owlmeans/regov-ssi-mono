
import { 
  credentialShape, 
  didShape 
} from '@owlmeans/regov-ssi-agent/src/debug/utils/shapes'


export const governanceSubject = {
  source: didShape
}

export const govrnanceShape = {
  ...credentialShape,
  credentialSubject: {
    ...governanceSubject
  }
}