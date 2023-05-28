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

import { EmptyProps, RegovComponentProps, withRegov } from '../../../common'
import copy from 'copy-to-clipboard'
import saveAs from 'file-saver'
import { Fragment, FunctionComponent } from 'react'
import Button from '@mui/material/Button'


export const CredentialActionGroup: FunctionComponent<CredentialActionGroupParams> = withRegov<
  CredentialActionGroupProps
>({ namespace: 'regov-wallet-credential' }, ({ t, remove, content, prettyOutput, exportTitle }) => {
  content = typeof content === 'string' ? content : JSON.stringify(
    content, undefined, prettyOutput ? 2 : undefined
  )

  return <Fragment>
    {remove && <Button onClick={remove}>{`${t('actionGroup.remove')}`}</Button>}
    <Button onClick={() => {
      copy(content as string, {
        message: t([`actionGroup.copyhint`, 'clipboard.copyhint']),
        format: 'text/plain'
      })
    }}>{`${t('actionGroup.copy')}`}</Button>
    {exportTitle && <Button onClick={() => {
      saveAs(new Blob([content as string], { type: "text/plain;charset=utf-8" }), `${exportTitle}.json`)
    }}>{`${t('actionGroup.export')}`}</Button>}
  </Fragment >
})

export type CredentialActionGroupParams = EmptyProps & {
  content: string | Object
  prettyOutput?: boolean
  exportTitle?: string
  remove?: () => void
}

export type CredentialActionGroupProps = RegovComponentProps<CredentialActionGroupParams>