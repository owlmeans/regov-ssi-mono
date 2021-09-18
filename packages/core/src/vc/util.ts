import { Presentation } from "./types"

export const isPresentation = (obj: any): obj is Presentation => {
  return typeof obj === 'object' && !!obj.verifiableCredential
}