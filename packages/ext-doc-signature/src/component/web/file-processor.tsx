import { Grid, Paper, TextField, IconButton, FormControl, Typography, FormHelperText } from '@mui/material'
import { EmptyProps, RegovComponetProps, RegovValidationRules, withRegov } from '@owlmeans/regov-lib-react'
import { formatError } from '@owlmeans/regov-mold-wallet-web'
import React, { useCallback, useState } from 'react'
import { Controller, useFormContext, UseFormProps, UseFormReturn } from 'react-hook-form'
import { Close, Delete } from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { REGOV_EXT_SIGNATURE_NAMESPACE } from '../../types'


export const FileProcessor = withRegov<FileProcessorProps>({ namespace: REGOV_EXT_SIGNATURE_NAMESPACE },
  (props) => {
    const { t, rules, field, process } = props
    const methods = useFormContext()

    const onDrop = useCallback(async (files: File[]) => {
      if (files.length) {
        const reader = new FileReader()

        reader.onabort = () => {
          methods.setError(field, { type: 'file.aborted' })
        }

        reader.onerror = () => {
          methods.setError(field, { type: 'file.error' })
        }

        reader.onload = () => {
          methods.setValue(field, reader.result as string, { shouldValidate: true })
        }

        reader.readAsText(files[0])
      }
    }, [])


    const [showInput, setShowInput] = useState<boolean>(false)
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true, maxFiles: 1 })

    const document = methods.watch(field)
    const hasDoc = document && document !== ''

    return <Paper {...getRootProps()} variant={isDragActive || hasDoc ? "elevation" : "outlined"}>
      <input {...getInputProps()} />
      <Controller name={field} control={methods.control} rules={rules && rules[field]}
        render={({ field, fieldState }) => {
          const success = hasDoc && !fieldState.invalid
          
          return <Grid container direction="column" justifyContent="center" alignItems="stretch" minHeight={200}>
            <Grid item container direction="row" justifyContent="center" alignItems="center">
              {showInput
                ? <TextField fullWidth multiline margin="normal" variant="filled"
                  InputLabelProps={{ shrink: true }} maxRows={15} minRows={5}
                  {...field} label={t('processor.input.label')} error={fieldState.invalid}
                  helperText={
                    fieldState.invalid ? formatError(t, "processor.input", fieldState) : t('processor.input.hint')
                  }
                  InputProps={{
                    sx: { fontSize: 10, fontFamily: "monospace" },
                    endAdornment: <IconButton size="large" color="primary" edge="end"
                      onClick={() => {
                        setShowInput(false)
                        methods.handleSubmit(process(methods))()
                      }}>
                      <Close fontSize="inherit" />
                    </IconButton>
                  }}
                />
                : <Grid item container direction="row" justifyContent="flex-end" alignItems="center">
                  <Grid item container direction="row" justifyContent="center" alignItems="center"
                    px={3} xs={hasDoc ? 11 : 12}>
                    <FormControl>
                      <Typography sx={{ color: success ? "success.main" : "main" }}>{t(
                        document
                          ? 'processor.import.loaded'
                          : isDragActive ? 'processor.import.drop' : 'processor.import.here'
                      )}</Typography>
                      {fieldState.invalid && <FormHelperText error={true}>
                        {formatError(t, "processor.input", fieldState)}
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
  })

export type FileProcessorParams = EmptyProps & {
  rules?: RegovValidationRules
  field: string
  form?: UseFormProps
  process: FileProcessorMethod
}

export type FileProcessorProps = RegovComponetProps<FileProcessorParams>

export type FileProcessorMethod = (methods: UseFormReturn<FileProcessorFields>) =>
  (data: FileProcessorFields) => Promise<void>

export type FileProcessorFields = { [key: string]: string }