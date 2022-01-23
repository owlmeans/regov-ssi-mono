import { Extension } from '@owlmeans/regov-ssi-extension'
import React, {
  FunctionComponent
} from 'react'


export const ValidationWidget = (_: Extension<string>): FunctionComponent =>
  () => {
    return <div>Hello world</div>
  }