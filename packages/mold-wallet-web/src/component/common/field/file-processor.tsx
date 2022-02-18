import { Grid, Paper, TextField, IconButton, FormControl, Typography, FormHelperText, Button } from '@mui/material'
import { EmptyProps, RegovValidationRules, WrappedComponentProps } from '@owlmeans/regov-lib-react'
import { formatError } from '../error'
import React, { useCallback, useState } from 'react'
import { Controller, useFormContext, UseFormProps } from 'react-hook-form'
import { Close, Delete } from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'


export const FileProcessorWeb = (props: FileProcessorImplProps) => {
  const { t, rules, field, process, onDrop, isCode, handler } = props
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

  if (handler) {
    handler.setShowInput = setShowInput
  }

  const document = methods.watch(field)
  const hasDoc = document && document !== ''

  return <Paper {...getRootProps()} variant={isDragActive || hasDoc ? "elevation" : "outlined"}>
    <input {...getInputProps()} />
    <Controller name={field} control={methods.control} rules={rules && rules[field]}
      render={({ field, fieldState }) => {
        const success = hasDoc && !fieldState.invalid

        return <Grid container direction="column" justifyContent="center" alignItems="stretch" minHeight={200}
          onClick={() => !showInput && openInput()}>
          <Grid item container direction="row" justifyContent="center" alignItems="center">
            {showInput
              ? <Grid item container direction="column" justifyContent="flex-start" alignItems="stretch">
                <Grid item container direction="row" justifyContent="flex-end" alignItems="flex-start">
                  <Grid item>
                    <Button onClick={open}>{t(`${field.name}.browse`)}</Button>
                  </Grid>
                </Grid>
                <Grid item>
                  <TextField fullWidth multiline margin="normal" variant="filled"
                    InputLabelProps={{ shrink: true }} maxRows={15} minRows={5}
                    {...field} label={t(`${field.name}.input.label`)} error={fieldState.invalid}
                    helperText={
                      fieldState.invalid
                        ? formatError(t, `${field.name}.input`, fieldState)
                        : t(`${field.name}.input.hint`)
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
                    <Typography sx={{ color: success ? "success.main" : "main" }}>{t(
                      document
                        ? `${field.name}.import.loaded`
                        : isDragActive ? `${field.name}.import.drop` : `${field.name}.import.here`
                    )}</Typography>
                    {fieldState.invalid && <FormHelperText error={true}>
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
  isCode?: boolean
  handler?: FileProcessorParamsHandler
}

export type FileProcessorParamsHandler = {
  setShowInput?: (showInput: boolean) => void
}

export type FileProcessorImplProps = WrappedComponentProps<FileProcessorParams>

export type FileProcessorMethod = () => Promise<void> | void

export type FileProcessorFields = { [key: string]: string }

export type FileOnDrop = (files: File[]) => Promise<void>