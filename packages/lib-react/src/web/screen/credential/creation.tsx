/**
 *  Copyright 2022 OwlMeans
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

import React, { Fragment, FunctionComponent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  useRegov, withRegov, EXTENSION_ITEM_PURPOSE_CREATION, PurposeCredentialCreationParams 
} from '../../../common'
import { CREDENTIAL_LIST_ROUTE } from '../../component'


export const CredentialCreation = withRegov({ namespace: 'regov-wallet-credential' }, () => {
  const { ext, type } = useParams()
  const { extensions } = useRegov()
  const navigate = useNavigate()

  if (!extensions || !ext || !type) {
    return <Fragment />
  }

  const uiExt = extensions.getExtensionByCode(ext)

  if (!uiExt) {
    return <Fragment />
  }

  const renderers = uiExt.produceComponent(EXTENSION_ITEM_PURPOSE_CREATION, type)

  if (!renderers[0]) {
    return <Fragment />
  }

  const Renderer = renderers[0].com as FunctionComponent<PurposeCredentialCreationParams>

  return <Renderer next={() => navigate(CREDENTIAL_LIST_ROUTE)} />
})