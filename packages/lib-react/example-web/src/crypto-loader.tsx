import { FC, useEffect } from 'react'
import { CryptoLoaderProps } from '@owlmeans/regov-lib-react'
import { encodeBase58, decodeBase58, toBeArray, getBytes, sha256, randomBytes, HDNodeWallet } from 'ethers'
import { getCryptoAdapter } from '@owlmeans/regov-ssi-core'
import { signSync, verify } from '@noble/secp256k1'

const aes = require('browserify-aes/browser')

const CryptoLoader: FC<CryptoLoaderProps> = ({ onFinish }) => {
  useEffect(() => {
    const adapter = getCryptoAdapter()
    adapter.setBase58Impl(encodeBase58, decodeBase58, toBeArray)
    adapter.setSha256Impl(sha256, getBytes)
    adapter.setAesImpl(aes)
    adapter.setRandomImpl(randomBytes)
    adapter.setSecpImpl(signSync, verify)
    adapter.WalletClass = HDNodeWallet as any
    onFinish()
  }, [])

  return <></>
}

export default CryptoLoader
