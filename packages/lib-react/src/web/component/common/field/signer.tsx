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
import { Grid } from '@mui/material'


export const FieldSigner = ({}: FieldSignerProps ) => {
  /**
   * @PROCEED
   * @TODO Implement signer widget and add it to universal credential signing process
   * Widget returns the list of identities, and access to them, including the default one
   */
  return <Grid item>
    
  </Grid>
}

export type FieldSignerProps = WrappedComponentProps<{
}>