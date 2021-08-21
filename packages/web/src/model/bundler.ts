
import { DID_PREFIX } from './types'

export const bundle = (obj: Object, type: string) => {
  return `${DID_PREFIX}:${type
    }:${Buffer.from(JSON.stringify(obj), 'utf8').toString('base64')}`
}