import { FC, useEffect } from 'react'
import { CryptoLoaderProps } from '@owlmeans/regov-lib-react'

import { encodeBase58, decodeBase58, toBeArray } from 'ethers'
import { getCryptoAdapter } from '@owlmeans/regov-ssi-core'

const CryptoLoader: FC<CryptoLoaderProps> = ({ onFinish }) => {
  useEffect(() => {
    getCryptoAdapter().setBase58Impl(encodeBase58, decodeBase58, toBeArray)
    onFinish()
  }, [])

  return <></>
}

export default CryptoLoader
