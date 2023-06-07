/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { FC, useEffect } from 'react'
import { CryptoLoaderProps } from '@owlmeans/regov-lib-react'
import { encodeBase58, decodeBase58, toBeArray, getBytes, sha256, randomBytes, HDNodeWallet } from 'ethers'
import { getCryptoAdapter } from '@owlmeans/regov-ssi-core'
import { signSync, verify } from '@noble/secp256k1'

const aes = require('browserify-aes/browser')

const CryptoLoader: FC<CryptoLoaderProps> = ({ onFinish, deps }) => {
  useEffect(() => {
    const adapter = getCryptoAdapter()
    adapter.setBase58Impl(encodeBase58, decodeBase58, toBeArray)
    adapter.setSha256Impl(sha256, getBytes)
    adapter.setAesImpl(aes)
    adapter.setRandomImpl(randomBytes)
    adapter.setSecpImpl(signSync, verify)
    adapter.WalletClass = HDNodeWallet as any
    return onFinish()
  }, deps ?? [])

  return <></>
}

export default CryptoLoader
