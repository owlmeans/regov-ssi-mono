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
      }
    )
  }, [field, files.length])

  const onDrop = useCallback(async (uploaded: File[]) => {
    const loader = navigator.invokeLoading && await navigator?.invokeLoading()
    if (uploaded.length) {
      let counter = 0
      const stopLoading = () => {
        if (--counter <= 0) {
          loader?.finish()
        }
      }
      const reader = new FileReader()
      reader.onabort = () => {
        methods.setError(field, { type: 'file.aborted' })
        stopLoading()
      }

      reader.onerror = () => {

        methods.setError(field, { type: 'file.error' })
        stopLoading()
      }

      reader.onload = () => {
        setFiles([...files, reader.result as ArrayBuffer])
        stopLoading()
      }

      uploaded.map(file => {
        reader.readAsArrayBuffer(file)
      })
      console.log(loader)
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: onDrop, noClick: true, accept: { 'image/jpeg': ['.jpg', '.jpeg'] } as any
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