import { Button } from '@mui/material'
import { EmptyProps, RegovComponentProps, withRegov } from '../../../common'
import copy from 'copy-to-clipboard'
import saveAs from 'file-saver'
import React, { Fragment, FunctionComponent } from 'react'


export const CredentialActionGroup: FunctionComponent<CredentialActionGroupParams> = withRegov<
  CredentialActionGroupProps
>({ namespace: 'regov-wallet-credential' }, ({ t, content, prettyOutput, exportTitle }) => {
  content = typeof content === 'string' ? content : JSON.stringify(
    content, undefined, prettyOutput ? 2 : undefined
  )

  return <Fragment>
    <Button onClick={() => {
      copy(content as string, {
        message: t([`actionGroup.copyhint`, 'clipboard.copyhint']),
        format: 'text/plain'
      })
    }}>{t('actionGroup.copy')}</Button>
    {exportTitle && <Button onClick={() => {
      saveAs(new Blob([content as string], { type: "text/plain;charset=utf-8" }), `${exportTitle}.json`)
    }}>{t('actionGroup.export')}</Button>}
  </Fragment >
})

export type CredentialActionGroupParams = EmptyProps & {
  content: string | Object
  prettyOutput?: boolean
  exportTitle?: string
}

export type CredentialActionGroupProps = RegovComponentProps<CredentialActionGroupParams>