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

import { EmptyProps, RegovValidationRules, WrappedComponentProps } from '../../../../common'
import { formatError } from '../error'
import { useCallback, useState } from 'react'
import { Controller, useFormContext, UseFormProps } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { isMobile } from "react-device-detect"
import Close from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'


export const FileProcessorWeb = (props: FileProcessorImplProps) => {
  const { t, square, rules, field, process, onDrop, isCode, fileHandler } = props
  const methods = useFormContext()

  const onDropCallback = useCallback(onDrop, [])

  const [showInput, setShowInput] = useState<boolean>(false)
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onDropCallback, noClick: true, maxFiles: 1
  })

  const openInput = () => {
    setShowInput(true)
    methods.trigger(field)
  }

  if (fileHandler) {
    fileHandler.setShowInput = setShowInput
  }

  const document = methods.watch(field)
  const hasDoc = document && document !== ''

  return <Paper {...getRootProps()} square={square} variant={isDragActive || hasDoc ? "elevation" : "outlined"}>
    <input {...getInputProps()} />
    <Controller name={field} control={methods.control} rules={rules && rules[field]}
      render={({ field, fieldState }) => {
        const success = hasDoc && !fieldState.invalid

        return isMobile
          ? <Grid item container direction="row" justifyContent="flex-end" alignItems="center" minHeight={200}
            onClick={open}>
            <Grid item container direction="row" justifyContent="center" alignItems="center"
              px={3} xs={hasDoc ? 11 : 12}>
              <FormControl>
                <Typography sx={{ color: success ? "success.main" : "main" }}>{`${t(
                  document ? `${field.name}.mobile.import.loaded` : `${field.name}.mobile.import.label`
                )}`}</Typography>
                {fieldState.error && <FormHelperText error={true}>
                  {formatError(t, `${field.name}.mobile.input`, fieldState)}
                </FormHelperText>}
              </FormControl>
            </Grid>
            {hasDoc && <Grid item xs={1}>
              <IconButton onClick={(event) => {
                event.stopPropagation()
                methods.reset()
              }}>
                <Delete />
              </IconButton>
            </Grid>}
          </Grid>
          : <Grid container direction="column" justifyContent="center" alignItems="stretch" minHeight={200}
            onClick={() => !showInput && openInput()}>
            <Grid item container direction="row" justifyContent="center" alignItems="center">
              {showInput
                ? <Grid item container direction="column" justifyContent="flex-start" alignItems="stretch">
                  <Grid item container direction="row" justifyContent="flex-end" alignItems="flex-start">
                    <Grid item>
                      <Button onClick={open}>{`${t(`${field.name}.browse`)}`}</Button>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <TextField fullWidth multiline margin="normal" variant="filled"
                      InputLabelProps={{ shrink: true }} maxRows={15} minRows={5}
                      {...field} label={`${t(`${field.name}.input.label`)}`} error={!!fieldState.error}
                      helperText={
                        `${fieldState.error
                          ? formatError(t, `${field.name}.input`, fieldState)
                          : t(`${field.name}.input.hint`)}`
                      }
                      InputProps={{
                        sx: isCode ? { fontSize: 10, fontFamily: "monospace" } : {},
                        endAdornment: <IconButton size="large" color="primary" edge="end"
                          onClick={() => {
                            setShowInput(false)
                            process()
                          }}>
                          <Close fontSize="inherit" />
                        </IconButton>
                      }}
                    /></Grid>
                </Grid>
                : <Grid item container direction="row" justifyContent="flex-end" alignItems="center">
                  <Grid item container direction="row" justifyContent="center" alignItems="center"
                    px={3} xs={hasDoc ? 11 : 12}>
                    <FormControl>
                      <Typography sx={{ color: success ? "success.main" : "main" }}>{`${t(
                        document
                          ? `${field.name}.import.loaded`
                          : isDragActive ? `${field.name}.import.drop` : `${field.name}.import.here`
                      )}`}</Typography>
                      {fieldState.error && <FormHelperText error={true}>
                        {formatError(t, `${field.name}.input`, fieldState)}
                      </FormHelperText>}
                    </FormControl>
                  </Grid>
                  {hasDoc && <Grid item xs={1}>
                    <IconButton onClick={(event) => {
                      event.stopPropagation()
                      methods.reset()
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

export type FileProcessorParams = EmptyProps & {
  rules?: RegovValidationRules
  field: string
  form?: UseFormProps
  process: FileProcessorMethod
  onDrop: FileOnDrop
  square?: boolean
  isCode?: boolean
  fileHandler?: FileProcessorParamsHandler
}

export type FileProcessorParamsHandler = {
  setShowInput?: (showInput: boolean) => void
}

export type FileProcessorImplProps = WrappedComponentProps<FileProcessorParams>

export type FileProcessorMethod = () => Promise<void> | void

export type FileProcessorFields = { [key: string]: string }

export type FileOnDrop = (files: File[]) => Promise<void>