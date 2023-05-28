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

import * as React from 'react'
import { buildWalletWrapper, createWalletHandler, cryptoHelper } from '@owlmeans/regov-ssi-core'
import { useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'


export const DebugSSIView = () => {
  const handler = useMemo(createWalletHandler, [])

  useEffect(() => {
    (async () => {
      handler.wallet = await await buildWalletWrapper(
        { crypto: cryptoHelper }, '11111111', { alias: 'default', name: 'Development wallet' }, {
        prefix: 'exm',
        defaultSchema: 'https://schema.owlmeans.com',
        didSchemaPath: 'did-schema.json',
      })
      console.log(handler.wallet)
    })()
  }, [])

  return <View>
    <Text>Hello world</Text>
  </View>
}
