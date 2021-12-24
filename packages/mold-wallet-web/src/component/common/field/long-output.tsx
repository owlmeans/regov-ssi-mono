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
import { FormMainButton } from '../button'
import { saveAs } from 'file-saver'
import copy from 'copy-to-clipboard'


export const LongOutput = ({ field, rules, t, i18n, file }: LongOutputProps) => {
  const { control } = useFormContext()
  const valueHolder = { value: '' }

  return <Grid item container direction="column" justifyContent="flex-start" alignItems="stretch">
    <Grid item>&nbsp;</Grid>
    <Grid item container direction="row" justifyContent="flex-end" alignItems="flex-start" 
      columnSpacing={1}>
      {file
        ? <Grid item>
          <FormMainButton t={t} i18n={i18n} title={`${field}.save`} action={
            () => saveAs(new Blob(
              [valueHolder.value],
              { type: "text/plain;charset=utf-8" }
            ), file)
          } />
        </Grid>
        : undefined}
      <Grid item>
        <FormMainButton t={t} i18n={i18n} title={`${field}.copy`} action={
          () => copy(valueHolder.value, {
            message: t([`${field}.clipboard.copyhint`, 'clipboard.copyhint']),
            format: 'text/plain'
          })
        } />
      </Grid>
    </Grid>
    <Grid item>
      <Controller name={field} control={control} rules={rules && rules[field]}
        render={({ field: _field }) => {
          valueHolder.value = _field.value

          return <Typography variant="caption">
            <pre>{_field.value}</pre>
          </Typography>
        }} />
    </Grid>
  </Grid>
}

export type LongOutputProps = WrappedComponentProps<{
  field: string,
  file?: string
}>