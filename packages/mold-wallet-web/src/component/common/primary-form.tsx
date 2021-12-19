import React, {
  ReactElement
} from 'react'
import { 
  WrappedComponentProps 
} from '@owlmeans/regov-lib-react'
import {
  Card,
  CardContent,
  CardHeader,
  Grid
} from "@mui/material"


export const PrimaryForm = (props: PrimaryFormProps) => {
  return <Card>
    <CardHeader title={props.t(props.title, props)} action={props.action} />
    <CardContent>
      <Grid container direction="column" justifyContent="center" alignItems="stretch">
        {props.children}
      </Grid>
    </CardContent>
  </Card>
}

export type PrimaryFormProps = WrappedComponentProps<{
  action?: ReactElement
  title: string
}>
