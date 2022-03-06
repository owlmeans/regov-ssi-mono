import { Grid, TextField } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { formatError } from '../error'


export const PasswordInput = ({ t, field, rules }: PasswordInputProps) => {
  const { control } = useFormContext()

  return <Grid item>
    <Controller name={field} control={control} rules={rules && rules[field]}
      render={({ field: _field, fieldState }) => {
        return <TextField type="password" autoComplete="current-password" fullWidth margin="normal" variant="outlined"
          InputLabelProps={{ shrink: true }} {..._field}
          label={t(`${field}.label`)} error={fieldState.invalid}
          helperText={
            fieldState.invalid
              ? formatError(t, field, fieldState) // t(`${field}.error.${fieldState.error?.message || fieldState.error?.type || ''}`)
              : t(`${field}.hint`)
          }
        />
      }} />
  </Grid>
}

export type PasswordInputProps = WrappedComponentProps<{
  field: string
}>