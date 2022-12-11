import React, { FunctionComponent, useCallback, useEffect, useState } from "react"
import Grid from "@mui/material/Grid"
import { Controller, useFormContext } from "react-hook-form"
import { TFunction } from "i18next"
import Paper from "@mui/material/Paper"
import { useDropzone } from "react-dropzone"
import { useNavigator } from "@owlmeans/regov-lib-react"


export const PicsturesField: FunctionComponent<PricturesFieldProps> = ({ field, t, fieldType }) => {
  const methods = useFormContext()
  const navigator = useNavigator()

  const [files, setFiles] = useState<ArrayBuffer[]>([])

  useEffect(() => {
    methods.setValue(
      field, {
      files: files.map((file, page) => ({
        page, type: fieldType, mimeType: 'image/jpeg',
        binaryData: Buffer.from(file).toString('base64'),
      }))
    })
  }, files)

  const onDrop = useCallback(async (uploaded: File[]) => {
    if (uploaded.length) {
      const loader = navigator.invokeLoading && await navigator?.invokeLoading()
      let counter = 0
      const stopLoading = () => {
        if (++counter >= uploaded.length) {
          loader?.finish()
        }
      }

      const _files: ArrayBuffer[] = []

      await Promise.all(uploaded.map(file => new Promise((resolve) => {
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
          _files.push(reader.result as ArrayBuffer)
          stopLoading()
          resolve(undefined)
        }

        reader.readAsArrayBuffer(file)
      })))

      setFiles([...files, ..._files])
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: onDrop, accept: ['image/jpeg'] as any
  })

  return <Controller name={field} control={methods.control} render={({ }) => {
    return <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
      {
        files.map((_, idx) => {
          return <Grid item key={idx}>
            Hello world
          </Grid>
        })
      }
      <Paper {...getRootProps()}>
        <input {...getInputProps()} />
        {t(`${field}.upload.new_files`) as string}
      </Paper>
    </Grid>
  }} />
}

export type PricturesFieldProps = {
  field: string
  fieldType: string
  t: TFunction
}