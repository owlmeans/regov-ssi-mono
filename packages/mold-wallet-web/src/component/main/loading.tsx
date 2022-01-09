import React, {
  Fragment, useState
} from 'react'

import {
  Alert,
  AlertTitle,
  Backdrop,
  CircularProgress,
  Snackbar
} from '@mui/material'

import {
  MainLoadingImplProps
} from '@owlmeans/regov-lib-react'


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
      <Alert onClose={handleClose} severity={t(`alert.${errorType || 'error'}.severity`)}>
        <AlertTitle>{t(`alert.${errorType || 'error'}.label`)}</AlertTitle>
        {t(error || 'error.default')}
      </Alert>
    </Snackbar>
  </Fragment>
}