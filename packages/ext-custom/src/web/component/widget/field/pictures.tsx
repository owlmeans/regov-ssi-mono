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

import { FunctionComponent, useCallback, useEffect, useState } from "react"
import Grid from "@mui/material/Grid"
import { Controller, useFormContext } from "react-hook-form"
import { TFunction } from "i18next"
import Paper from "@mui/material/Paper"
import { useDropzone } from "react-dropzone"
import { useNavigator } from "@owlmeans/regov-lib-react"
import { FileInfo } from '../../../../picture.types'
import Typography from '@mui/material/Typography'


export const PicsturesField: FunctionComponent<PricturesFieldProps> = ({ field, t, fieldType }) => {
  const methods = useFormContext()
  const navigator = useNavigator()

  const [files, setFiles] = useState<FileInfo[]>([])
  useEffect(() => { methods.setValue(field, { files }) }, [files])

  const onDrop = useCallback(async (uploaded: File[]) => {
    if (uploaded.length) {
      const loader = navigator.invokeLoading && await navigator?.invokeLoading()
      let counter = 0
      const stopLoading = () => {
        if (++counter >= uploaded.length) {
          loader?.finish()
        }
      }

      const _files: FileInfo[] = []

      await Promise.all(uploaded.map((file, idx) => new Promise((resolve) => {
        const reader = new FileReader()
        reader.onabort = () => {
          methods.setError(field, { type: 'file.aborted' })
          stopLoading()
          resolve(undefined)
        }

        reader.onerror = () => {
          methods.setError(field, { type: 'file.error' })
          stopLoading()
          resolve(undefined)
        }

        reader.onload = () => {
          console.log(file.name, file.type)
          _files.push({
            page: `page:${idx}`, name: file.name, type: fieldType, mimeType: file.type,
            binaryData: Buffer.from(reader.result as ArrayBuffer).toString('base64'),
          })
          stopLoading()
          resolve(undefined)
        }

        reader.readAsArrayBuffer(file)
      })))

      setFiles([...files, ..._files])
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: onDrop, accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    }
  })

  return <Controller name={field} control={methods.control} render={({ field: _field }) => {
    return <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
      {files.map((file) => <Grid item key={file.page}>{file.name}</Grid>)}
      <Paper {...getRootProps()}>
        <input {...getInputProps()} />
        <Typography>{t(`${field}.upload.new_files`) as string}</Typography>
      </Paper>
    </Grid>
  }} />
}

export type PricturesFieldProps = {
  field: string
  fieldType: string
  t: TFunction
}