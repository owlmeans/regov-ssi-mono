
import {
  DID_PREFIX,
  ERROR_BUNDLER_UNSUPPORTED_DID_PREFIX,
  ERROR_BUNDLER_WRONG_PREFIX,
  ERROR_BUNDLER_WRONG_STRUCTURE
} from './types'

export const bundle = (obj: Object, type: string) => {
  return `bundle:${DID_PREFIX}:${type
    }:${Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')}`
}

export const unbundle = (bundle: string) => {
  const parts = bundle.split(':', 4)
  if (parts.length !== 4) {
    throw new Error(ERROR_BUNDLER_WRONG_STRUCTURE)
  }
  if (parts[0] !== 'bundle') {
    throw new Error(ERROR_BUNDLER_WRONG_PREFIX)
  }
  if (parts[1] !== DID_PREFIX) {
    throw new Error(ERROR_BUNDLER_UNSUPPORTED_DID_PREFIX)
  }

  return {
    type: parts[2],
    document: JSON.parse(Buffer.from(parts[3], 'base64').toString('utf8'))
  }
}