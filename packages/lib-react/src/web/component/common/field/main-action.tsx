/**
 *  Copyright 2023 OwlMeans
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


import { WrappedComponentProps } from '../../../../common'
import { FormMainButtonProps, FormMainButton } from '../button/form-main'
import Grid from '@mui/material/Grid'


export const FormMainAction = (props: FormMainActionProps) =>
  <Grid container item direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
    <Grid item xs={6}>
      <FormMainButton {...props} />
    </Grid>
  </Grid>

export type FormMainActionProps = WrappedComponentProps<{
} & FormMainButtonProps>