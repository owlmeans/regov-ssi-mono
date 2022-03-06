import React from 'react'

import { Grid } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import { FormMainButtonProps, FormMainButton } from '../button/form-main'


export const FormMainAction = (props: FormMainActionProps) =>
  <Grid container item direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
    <Grid item xs={6}>
      <FormMainButton {...props} />
    </Grid>
  </Grid>

export type FormMainActionProps = WrappedComponentProps<{
} & FormMainButtonProps>