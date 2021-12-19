import React from 'react'
import {
  Grid,
  TextField
} from '@mui/material'
import { WrappedComponentProps } from '@owlmeans/regov-lib-react'
import {
  useFormContext,
  Controller
} from 'react-hook-form'
import { formatError } from '../error'


export const MainTextInput = ({ t, field, rules }: MainTextInputProps) => {
  const { control } = useFormContext()

  return <Grid item>
    <Controller name={field} control={control} rules={rules && rules[field]}
      render={({ field: _field, fieldState }) => {

        return <TextField fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
          {..._field} label={t(`${field}.label`)} error={fieldState.invalid}
          helperText={
            fieldState.invalid
            ? formatError(t, field, fieldState) // t(`${field}.error.${fieldState.error?.message || fieldState.error?.type || ''}`)
            : t(`${field}.hint`)
          } 
        />
      }} />
  </Grid>
}

export type MainTextInputProps = WrappedComponentProps<{
  field: string
}>