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


export const LongTextInput = ({ t, field, rules, rows, maxRows }: LongTextInputProps) => {
  const { control } = useFormContext()

  return <Grid item>
    <Controller name={field} control={control} rules={rules && rules[field]}
      render={({ field: _field, fieldState }) => {
        rows = rows || 3

        return <TextField fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
          multiline {...(
            maxRows
              ? typeof maxRows === 'boolean'
                ? { minRows: rows, maxRows: rows * 2 }
                : { minRows: rows, maxRows }
              : { rows }
          )}
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

export type LongTextInputProps = WrappedComponentProps<{
  field: string
  rows?: number
  maxRows?: number | boolean
}>