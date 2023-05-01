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

import { CredentialListTab, WrappedComponentProps } from '../../../../common'
import { REGISTRY_SECTION_PEER } from '@owlmeans/regov-ssi-core'
import React, { Fragment } from 'react'
import Switch from '@mui/material/Switch'


export const CredentialListHeaderAction = (props: HeaderActionProps) => {
  const { details, section, action } = props

  if (!details.registry.sections) {
    if (details.registry.allowPeer) {
      return <Switch checked={section === REGISTRY_SECTION_PEER} onChange={action}/>
    }
  }

  return <Fragment />
}


export type HeaderActionProps = WrappedComponentProps<HeaderActionParams>

export type HeaderActionParams = {
  section: string
  details: CredentialListTab
  action: () => void
}