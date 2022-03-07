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