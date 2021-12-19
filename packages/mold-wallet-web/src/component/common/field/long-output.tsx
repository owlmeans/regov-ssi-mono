import React from 'react'
import {
  Grid,
  Typography
} from '@mui/material'
import { WrappedComponentProps } from '@owlmeans/regov-lib-react'
import {
  useFormContext,
  Controller
} from 'react-hook-form'


export const LongOutput = ({ field, rules }: LongOutputProps) => {
  const { control } = useFormContext()

  return <Grid item>
    <Controller name={field} control={control} rules={rules && rules[field]}
      render={({ field: _field }) => {

        return <Typography variant="caption">
          <pre>{_field.value}</pre>
        </Typography>
      }} />
  </Grid>
}

export type LongOutputProps = WrappedComponentProps<{
  field: string
}>