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
import { ButtonParams } from './types'
import Button from '@mui/material/Button'


export const FormMainButton = ({ t, title, action }: FormMainButtonProps) =>
  <Button fullWidth variant="contained" size="large" color="primary" onClick={action}>{`${t(title)}`}</Button>

export type FormMainButtonProps = WrappedComponentProps<ButtonParams>