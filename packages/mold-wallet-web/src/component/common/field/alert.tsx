import React, {
  Fragment
} from 'react'

import {
  Grid,
  Alert,
  AlertTitle
} from '@mui/material'
import {
  useFormContext,
  Controller
} from 'react-hook-form'
import { WrappedComponentProps } from '@owlmeans/regov-lib-react'
import { formatError } from '../error'


export const AlertOutput = ({ t, field }: AlertOutputProps) => {
  const { control } = useFormContext()

  return <Grid item>
    <Controller name={field} control={control} render={
      ({ field, fieldState }) => {
        const type = fieldState.error?.type || 'error'

        return fieldState.invalid ? <Alert severity={t([
          `${field.name}.error.severity.${type}`,
          `${field.name}.error.severity.error`,
          'alert.error.severity'
        ])}>
          <AlertTitle>{t([
            `${field.name}.error.title.${type}`,
            `alert.error.label`,
          ])}</AlertTitle>
          {formatError(t, field.name, fieldState)}
        </Alert> : <Fragment></Fragment>
      }
    } />
  </Grid>
}


export type AlertOutputProps = WrappedComponentProps<{
  field: string
}>