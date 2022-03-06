import React from 'react'

import { StoreListImplProps } from '../../../common'
import { FormHeaderButton, SimpleList, SimpleListItem } from '../../component/common'
import { Grid, ListItemSecondaryAction } from '@mui/material'
import { saveAs } from 'file-saver'
import { useDropzone } from "react-dropzone"


export const StoreListWeb = (props: StoreListImplProps) => {
  const onDrop = async (files: File[]) => {
    if (files.length) {
      const reader = new FileReader()

      reader.onabort = () => {
        // if (alert) {
        //   setError(alert, { type: 'file.aborted' })
        // }
      }

      reader.onerror = () => {
        // if (alert) {
        //   setError(alert, { type: 'file.error' })
        // }
      }

      reader.onload = () => {
        props.upload(JSON.parse(reader.result as string))
      }

      reader.readAsText(files[0])
    }
  }
  const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true, maxFiles: 1 })

  return <span {...getRootProps()}><SimpleList {...props} title="list.title" actions={[
    { title: 'list.create', action: props.create },
    { title: 'list.import', action: open }
  ]}>
    <input {...getInputProps()} />
    {
      props.stores.length
        ? props.stores.map(
          store => <SimpleListItem key={store.alias} {...props} label={store.name}
            hint={store.alias} noTranslation action={() => props.login(store.alias)}>
            <ListItemSecondaryAction>
              <Grid columnSpacing={1} container>
                <Grid item>
                  <FormHeaderButton {...props} title='list.item.export' action={() => saveAs(new Blob(
                    [JSON.stringify(store)], { type: "text/plain;charset=utf-8" }
                  ), `${store.alias}.wallet.json`)} />
                </Grid>
                <Grid item>
                  <FormHeaderButton {...props} title='list.item.delete' action={
                    () => props.delete(store.alias)
                  } />
                </Grid>
              </Grid>
            </ListItemSecondaryAction>
          </SimpleListItem>
        )
        : <SimpleListItem {...props} label={'list.empty'} />
    }
  </SimpleList></span>
}