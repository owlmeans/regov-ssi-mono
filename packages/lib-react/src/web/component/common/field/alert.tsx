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
import { Grid, Alert, AlertTitle } from '@mui/material'
import { useFormContext, Controller } from 'react-hook-form'
import { WrappedComponentProps } from '../../../../common'
import { formatError } from '../error'


export const AlertOutput = ({ t, field }: AlertOutputProps) => {
  const { control } = useFormContext()

  return <Grid item>
    <Controller name={field} control={control} render={
      ({ field, fieldState }) => {
        const type = fieldState.error?.type || 'error'

        return fieldState.invalid ? <Alert severity={t([
          `${field.name}.error.severity.${type}`,
          `${field.name}.error.severity.error`,
          'alert.error.severity'
        ])}>
          <AlertTitle>{t([
            `${field.name}.error.title.${type}`,
            `alert.error.label`,
          ])}</AlertTitle>
          {formatError(t, field.name, fieldState)}
        </Alert> : <Fragment></Fragment>
      }
    } />
  </Grid>
}


export type AlertOutputProps = WrappedComponentProps<{
  field: string
}>