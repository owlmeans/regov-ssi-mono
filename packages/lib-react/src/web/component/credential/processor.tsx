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

import React, { useCallback, useEffect, useState } from 'react'
import { CredentialProcessorFields, CredentialProcessorImplProps } from '../../../common'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm, UseFormProps } from 'react-hook-form'
import { formatError } from '../common'
import { isMobile } from "react-device-detect"
import Close from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'


export const CredentialProcessorWeb = ({ t, form, rules, process }: CredentialProcessorImplProps) => {
  const methods = useForm<CredentialProcessorFields>(
    form as UseFormProps<CredentialProcessorFields>
  )

  const { control, setError, setValue, trigger, watch, handleSubmit, reset } = methods

  const onDrop = useCallback(async (files: File[]) => {
    if (files.length) {
      const reader = new FileReader()

      reader.onabort = () => {
        setError("document", { type: 'file.aborted' })
      }

      reader.onerror = () => {
        setError("document", { type: 'file.error' })
      }

      reader.onload = () => {
        setValue("document", reader.result as string, { shouldValidate: true })
      }

      reader.readAsText(files[0])
    }
  }, [])

  const [showInput, setShowInput] = useState(false)
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true, maxFiles: 1 })

  const document = watch("document")

  const hasDoc = document !== ''

  useEffect(() => {
    if (hasDoc) {
      handleSubmit(process(methods))()
    }
  }, [document])

  const openInput = () => {
    setShowInput(true)
    trigger("document")
  }

  return <Paper {...getRootProps()} variant={
    isDragActive || hasDoc ? "elevation" : "outlined"}>
    <input {...getInputProps()} />
    <Controller name="document" control={control} rules={rules && rules.document}
      render={({ field, fieldState }) => {
        const success = hasDoc && !fieldState.invalid

        return isMobile
          ? <Grid item container direction="row" justifyContent="flex-end" alignItems="center" minHeight={200}
            onClick={open}>
            <Grid item container direction="row" justifyContent="center" alignItems="center"
              px={3} xs={hasDoc ? 11 : 12}>
              <FormControl>
                <Typography sx={{ color: success ? "success.main" : "main" }}>
                  {`${t(document ? 'processor.mobile.import.loaded' : 'processor.mobile.import.label')}`}
                </Typography>
                {fieldState.invalid && <FormHelperText error={true}>
                  {formatError(t, "processor.mobile.input", fieldState)}
                </FormHelperText>}
              </FormControl>
            </Grid>
            {hasDoc && <Grid item xs={1}>
              <IconButton onClick={(event) => {
                event.stopPropagation()
                reset()
              }}>
                <Delete />
              </IconButton>
            </Grid>}
          </Grid>
          : <Grid container direction="column" justifyContent="center" alignItems="stretch" minHeight={200}
            onClick={() => !showInput && openInput()}>
            <Grid item container direction="row" justifyContent="center" alignItems="center">
              {showInput
                ? <TextField fullWidth multiline margin="normal" variant="filled"
                  InputLabelProps={{ shrink: true }} maxRows={15} minRows={5}
                  {...field} label={`${t('processor.input.label')}`} error={!!fieldState.error}
                  helperText={
                    `${fieldState.error ? formatError(t, "processor.input", fieldState) : t('processor.input.hint')}`
                  }
                  InputProps={{
                    sx: { fontSize: 10, fontFamily: "monospace" },
                    endAdornment: <IconButton size="large" color="primary" edge="end"
                      onClick={() => {
                        setShowInput(false)
                        handleSubmit(process(methods))()
                      }}>
                      <Close fontSize="inherit" />
                    </IconButton>
                  }}
                />
                : <Grid item container direction="row" justifyContent="flex-end" alignItems="center">
                  <Grid item container direction="row" justifyContent="center" alignItems="center"
                    px={3} xs={hasDoc ? 11 : 12}>
                    <FormControl>
                      <Typography sx={{ color: success ? "success.main" : "main" }}>{`${t(
                        document
                          ? 'processor.import.loaded'
                          : isDragActive ? 'processor.import.drop' : 'processor.import.here'
                      )}`}</Typography>
                      {fieldState.error && <FormHelperText error={true}>
                        {formatError(t, "processor.input", fieldState)}
                      </FormHelperText>}
                    </FormControl>
                  </Grid>
                  {hasDoc && <Grid item xs={1}>
                    <IconButton onClick={(event) => {
                      event.stopPropagation()
                      reset()
                    }}>
                      <Delete />
                    </IconButton>
                  </Grid>}
                </Grid>
              }
            </Grid>
          </Grid>
      }} />
  </Paper>
}