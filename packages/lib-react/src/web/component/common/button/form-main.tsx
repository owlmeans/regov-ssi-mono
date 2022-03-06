import React from 'react'

import { Button } from '@mui/material'
import { WrappedComponentProps } from '../../../../common'
import { ButtonParams } from './types'


export const FormMainButton = ({ t, title, action }: FormMainButtonProps) =>
  <Button fullWidth variant="contained" size="large" color="primary" onClick={action}>{t(title)}</Button>

export type FormMainButtonProps = WrappedComponentProps<ButtonParams>