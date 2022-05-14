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

import React, { Fragment, useState } from 'react'
import { Alert, AlertColor, AlertTitle, Backdrop, CircularProgress, Snackbar } from '@mui/material'
import { MainLoadingImplProps } from '../../../common'


/**
 * @TODO Localize messages with appropriate namespace
 */
export const MainLoadingWeb = ({ handle, t }: MainLoadingImplProps) => {
  const [isOpened, setOpen] = useState<boolean>(false)
  const [{ error, type: errorType }, setError] = useState<{ error?: string, type?: string }>({})

  handle.open = () => setOpen(true)
  handle.close = () => setOpen(false)
  handle.error = (err, type = 'error') => {
    err = err || 'error.default'
    setOpen(false)
    setError({ error: typeof err === 'string' ? err : err.message, type })
  }

  const handleClose = () => setError({})

  return <Fragment>
    <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }} open={isOpened}>
      <CircularProgress color="inherit" />
    </Backdrop>

    <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={handleClose} severity={`${t(`alert.${errorType || 'error'}.severity`)}` as unknown as AlertColor}>
        <AlertTitle>{`${t(`alert.${errorType || 'error'}.label`)}`}</AlertTitle>
        {`${t(error || 'error.default')}`}
      </Alert>
    </Snackbar>
  </Fragment>
}