import React from 'react'

import {
  Card,
  CardContent,
} from '@mui/material'
import {
  CredentialListImplProps
} from '@owlmeans/regov-lib-react'
import {
  SimpleList,
  SimpleListItem
} from '../../component/common'


export const CredentialListWeb = (props: CredentialListImplProps) => {
  console.log(props)

  return <Card>
    <CardContent>
      <SimpleList {...props} title="">
        {
          props.credentials.map(
            wrapper => <SimpleListItem
              {...props}
              key={wrapper.credential.id}
              noTranslation
              label={wrapper.meta.title || ''} />
          )
        }
      </SimpleList>
    </CardContent>
  </Card>
}