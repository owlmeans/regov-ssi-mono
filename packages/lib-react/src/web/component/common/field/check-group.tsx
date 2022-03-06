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