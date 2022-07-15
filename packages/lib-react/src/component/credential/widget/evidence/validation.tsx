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
import { EmptyProps, RegovComponentProps, withRegov, WrappedComponentProps } from '../../../../common/'
import { EvidenceValidationResult } from '@owlmeans/regov-ssi-core'


export const ValidationResultWidget: FunctionComponent<ResultWidgetParams> = withRegov<ResultWidgetProps>(
  { namespace: 'regov-wallet-credential' },
  ({ t, i18n, result, reload, com: Renderer }) => {
    const props = {
      t, i18n, result, reload
    }
    
    return Renderer ? <Renderer {...props} /> : <Fragment />
  }
)

export type ResultWidgetParams = EmptyProps & {
  result: EvidenceValidationResult
  reload?: () => void
  com?: FunctionComponent<ResultWidgetImplProps>
}

export type ResultWidgetProps = RegovComponentProps<ResultWidgetParams, ResultWidgetImplParams>

export type ResultWidgetImplParams = {
  reload?: () => void
  result: EvidenceValidationResult
}

export type ResultWidgetImplProps = WrappedComponentProps<ResultWidgetImplParams>