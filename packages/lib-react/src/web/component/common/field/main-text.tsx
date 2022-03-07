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

import React from 'react'
import { Grid, TextField } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import { useFormContext, Controller } from 'react-hook-form'
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