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

        // return <TextField fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
        //   multiline {...(
        //     maxRows
        //       ? typeof maxRows === 'boolean'
        //         ? { minRows: rows, maxRows: rows * 2 }
        //         : { minRows: rows, maxRows }
        //       : { rows }
        //   )}
        //   {..._field} label={t(`${field}.label`)} error={fieldState.invalid}
        //   helperText={
        //     fieldState.invalid
        //       ? formatError(t, field, fieldState) // t(`${field}.error.${fieldState.error?.message || fieldState.error?.type || ''}`)
        //       : t(`${field}.hint`)
        //   }
        // />
      }} />
  </Grid>
}

export type LongOutputProps = WrappedComponentProps<{
  field: string
}>