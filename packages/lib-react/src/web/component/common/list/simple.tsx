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

import React from 'react'
import { Card, CardActions, CardContent, CardHeader, Grid, List } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import { ButtonParams, FormMainButton } from '../button'


export const SimpleList = (props: SimpleListProps) => {
  const { t, title, actions, children, headerAction } = props

  return <Card>
    <CardHeader title={`${t(title)}`} action={headerAction} />
    <CardContent>
      <List>{children}</List>
    </CardContent>
    <CardActions>
      <Grid container spacing={1} direction="row" justifyContent="flex-end" alignItems="center">
        {actions?.map(
          action => <Grid item key={action.title}><FormMainButton {...props} {...action} /></Grid>
        )}
      </Grid>
    </CardActions>
  </Card>
}

export type SimpleListProps = WrappedComponentProps<SimpleListParams>

export type SimpleListParams = {
  title: string,
  headerAction?: React.ReactNode
  actions?: ButtonParams[]
}