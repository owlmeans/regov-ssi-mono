import React, { useCallback } from 'react'
import {
  Grid,
  TextField
} from '@mui/material'
import { WrappedComponentProps } from '@owlmeans/regov-lib-react'
import {
  useFormContext,
  Controller
} from 'react-hook-form'
import { formatError } from '../error'
import { useDropzone } from "react-dropzone"
import { FormHeaderButton } from '../button'


export const LongTextInput = ({ 
  t, field, rules, rows, maxRows, i18n, showImport, alert, sourceCode 
}: LongTextInputProps) => {
  const { control, setValue, setError } = useFormContext()
  const onDrop = useCallback(async (files: File[]) => {
    if (files.length) {
      const reader = new FileReader()

      reader.onabort = () => {
        if (alert) {
          setError(alert, { type: 'file.aborted' })
        }
      }

      reader.onerror = () => {
        if (alert) {
          setError(alert, { type: 'file.error' })
        }
      }

      reader.onload = () => {
        setValue(field, reader.result as string)
      }

      reader.readAsText(files[0])
    }
  }, [])
  const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true, maxFiles: 1 })

  return <Grid item container direction="column" justifyContent="flex-start" alignItems="stretch"
    {...getRootProps()}>
    <input {...getInputProps()} />
    {showImport
      ? <Grid item container direction="row" justifyContent="flex-end" alignItems="flex-start"
        columnSpacing={1}>
        <Grid item>
          <FormHeaderButton t={t} i18n={i18n} title={`${field}.import`} action={open} />
        </Grid>
      </Grid>
      : undefined
    }
    <Grid item>
      <Controller name={field} control={control} rules={rules && rules[field]}
        render={({ field: _field, fieldState }) => {
          rows = rows || 3

          return <TextField fullWidth margin="normal" variant="outlined" InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: sourceCode ? { fontSize: 12, fontFamily: "monospace" } : {},
            }}
            multiline {...(
              maxRows
                ? typeof maxRows === 'boolean'
                  ? { minRows: rows, maxRows: rows * 4 }
                  : { minRows: rows, maxRows }
                : { rows }
            )}
            {..._field} label={t(`${field}.label`)} error={fieldState.invalid}
            helperText={
              fieldState.invalid
                ? formatError(t, field, fieldState) // t(`${field}.error.${fieldState.error?.message || fieldState.error?.type || ''}`)
                : t(`${field}.hint`)
            }
          />
        }} />
    </Grid>
  </Grid>
}

export type LongTextInputProps = WrappedComponentProps<{
  field: string
  rows?: number
  maxRows?: number | boolean
  showImport?: boolean
  sourceCode?: boolean
  alert?: string
}>