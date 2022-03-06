import { Grid, TextField } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { formatError } from '../error'


export const NewPasswordInput = ({ t, field, rules }: NewPasswordInputProps) => {
  const { control } = useFormContext()

  return <Grid container item direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
    <Grid item xs={6}>
      <Controller name={`${field}.input`} control={control} rules={rules && rules[`${field}.input`]}
        render={({ field: _field, fieldState }) => {
          return <TextField type="password" autoComplete="new-password" fullWidth margin="normal" variant="outlined"
            InputLabelProps={{ shrink: true }} {..._field}
            label={t(`${field}.input.label`)} error={fieldState.invalid}
            helperText={
              fieldState.invalid
                ? formatError(t, `${field}.input`, fieldState) // t(`${field}.input.error.${fieldState.error?.message || fieldState.error?.type || ''}`)
                : t(`${field}.input.hint`)
            }
          />
        }} />
    </Grid>
    <Grid item xs={6}>
      <Controller name={`${field}.confirm`} control={control} rules={rules && rules[`${field}.confirm`]}
        render={({ field: _field, fieldState }) => {
          return <TextField type="password" autoComplete="new-password" fullWidth margin="normal" variant="outlined"
            InputLabelProps={{ shrink: true }} {..._field}
            label={t(`${field}.confirm.label`)} error={fieldState.invalid}
            helperText={
              fieldState.invalid
                ? formatError(t, `${field}.confirm`, fieldState) // t(`${field}.confirm.error.${fieldState.error?.message || fieldState.error?.type || ''}`)
                : t(`${field}.confirm.hint`)
            }
          />
        }} />
    </Grid>
  </Grid>
}

export type NewPasswordInputProps = WrappedComponentProps<{
  field: string
}>