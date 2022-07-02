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
import { WrappedComponentProps } from '../../../../common'
import { useFormContext, Controller } from 'react-hook-form'
import { ButtonParams, FormMainButton } from '../button'
import { saveAs } from 'file-saver'
import copy from 'copy-to-clipboard'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'


export const LongOutput = (props: LongOutputProps) => {
  const { field, rules, t, i18n, file, actions, longRead } = props
  const { control } = useFormContext()
  const valueHolder = { value: '' }

  return <Grid item container direction="column" justifyContent="flex-start" alignItems="stretch">
    <Grid item>&nbsp;</Grid>
    <Grid item container direction="row" justifyContent="flex-end" alignItems="flex-start"
      columnSpacing={1}>
      {actions?.map(
        action => <Grid item key={action.title}><FormMainButton {...props} {...action} /></Grid>
      )}
      {!longRead && file
        ? <Grid item>
          <FormMainButton t={t} i18n={i18n} title={`${field}.export`} action={
            () => saveAs(new Blob(
              [valueHolder.value],
              { type: "text/plain;charset=utf-8" }
            ), file)
          } />
        </Grid>
        : undefined}
      {!longRead
        && <Grid item>
          <FormMainButton t={t} i18n={i18n} title={`${field}.copy`} action={
            () => copy(valueHolder.value, {
              message: t([`${field}.clipboard.copyhint`, 'clipboard.copyhint']),
              format: 'text/plain'
            })
          } />
        </Grid>}
    </Grid>
    <Grid item>
      <Controller name={field} control={control} rules={rules && rules[field]}
        render={({ field: _field }) => {
          valueHolder.value = typeof _field.value === 'string'
            ? _field.value
            : JSON.stringify(_field.value, undefined, 2)

          return <FormControl focused fullWidth margin="normal" variant="standard">
            {longRead
              ? <Typography variant="body1">{valueHolder.value}</Typography>
              : <Typography variant="caption"><pre>{valueHolder.value}</pre></Typography>}
            <FormHelperText>{`${t(`${field}.hint`)}`}</FormHelperText>
          </FormControl>
        }} />
    </Grid>
  </Grid>
}

export type LongOutputProps = WrappedComponentProps<{
  field: string
  file?: string
  longRead?: boolean
  actions?: ButtonParams[]
}>