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

import React, { Fragment } from 'react'
import { FormGroup, Grid, FormControlLabel, FormHelperText, Checkbox } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import { useFormContext, Controller } from 'react-hook-form'
import { formatError } from '../error'


export const CheckGroup = ({ t, fields, rules }: CheckGroupProps) => {
  const { control } = useFormContext()

  return <Grid item>
    <FormGroup>
      {fields.map(field => {
        return <Controller key={field} name={field} control={control} rules={rules && rules[field]}
          render={({ field: _field, fieldState }) => {

            return <Fragment>
              <FormControlLabel control={<Checkbox {..._field} checked={_field.value} />}
                label={t(`${field}.label`) as string} />
              <FormHelperText error={fieldState.invalid}>{
                fieldState.invalid ? formatError(t, field, fieldState) : t(`${field}.hint`)
              }</FormHelperText>
            </Fragment>
          }} />
      })}
    </FormGroup>
  </Grid>
}

export type CheckGroupProps = WrappedComponentProps<{
  fields: string[]
}>