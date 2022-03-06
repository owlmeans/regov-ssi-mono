
import React from 'react'
import { Card, CardActions, CardContent, CardHeader, Grid, List } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import { ButtonParams, FormMainButton } from '../button'


export const SimpleList = (props: SimpleListProps) => {
  const { t, title, actions, children, headerAction } = props

  return <Card>
    <CardHeader title={t(title)} action={headerAction} />
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