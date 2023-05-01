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

import React, { useCallback } from 'react'
import { WrappedComponentProps } from '../../../../common'
import { useFormContext, Controller } from 'react-hook-form'
import { formatError } from '../error'
import { useDropzone } from "react-dropzone"
import { FormHeaderButton } from '../button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'


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
            {..._field} label={`${t(`${field}.label`)}`} error={!!fieldState.error}
            helperText={`${fieldState.error ? formatError(t, field, fieldState) : t(`${field}.hint`)}`}
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