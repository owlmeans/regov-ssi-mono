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
import { FormControl, FormHelperText, Grid, Input, InputLabel, Typography } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import { Controller, useFormContext } from 'react-hook-form'
import { formatError } from '../error'
import { OutputFieldFormatter } from './formatter'


export const MainTextOutput = (
  { t, field, showHint, showLabel, showIntro, inlineLabel, formatter, formatTemplate }: MainTextOutputProps
) => {
  const { control } = useFormContext()
  const showIntroLabel = !inlineLabel && showLabel
  const innlineLabel = inlineLabel || (!showIntroLabel && showLabel)

  return <Grid item>
    <Controller name={field} control={control} render={({ field: _field, fieldState }) =>
      <FormControl focused fullWidth margin="normal" variant="standard" error={fieldState.invalid}>
        {(showIntro || showIntroLabel) && <InputLabel htmlFor={`${field}.output`}>
          {showIntro ? t(`${field}.intro`) : showIntroLabel ? t(`${field}.label`) : ''}
        </InputLabel>}
        {/* inputProps={{ style: { textAlign: 'right' } }}  */}
        <Input readOnly disableUnderline id={`${field}.output`}
          startAdornment={
            innlineLabel && <Typography color="primary" marginRight={1} variant="subtitle1">
              {t(`${field}.label`)}:
            </Typography>
          } value={formatter ? formatter(_field.value, formatTemplate) : _field.value} />
        {(showHint || fieldState.invalid) && <FormHelperText error={fieldState.invalid}>
          {fieldState.invalid ? formatError(t, field, fieldState) : t(`${field}.hint`)}
        </FormHelperText>}
      </FormControl>
    } />
  </Grid>
}

export type MainTextOutputProps = WrappedComponentProps<{
  field: string
  showHint?: boolean
  showIntro?: boolean
  inlineLabel?: boolean
  showLabel?: boolean
  formatter?: OutputFieldFormatter
  formatTemplate?: string
}>