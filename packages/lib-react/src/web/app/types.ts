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

import { BasicNavigator, Config, UIExtensionRegistry } from "../../common"
import { NavigateFunction } from "react-router-dom"
import { WalletHandler } from "@owlmeans/regov-ssi-core"
import { ServerClient } from "../../common"
import { CryptoLoaderProps } from '../crypto/types'
import { FC } from 'react'


export type WalletAppParams = {
  config: Config
  extensions?: UIExtensionRegistry
  serverClient?: ServerClient
  CryptoLoader: FC<CryptoLoaderProps>
}

export type RootNavigatorBuilder = (
  navigate: NavigateFunction, handler: WalletHandler, config: Config
) => BasicNavigator
