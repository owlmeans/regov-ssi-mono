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



import { StoreListImplProps, MainFooter } from '../../../common'
import { FormHeaderButton, SimpleList, SimpleListItem } from '../../component/common'
import { saveAs } from 'file-saver'
import { useDropzone } from "react-dropzone"
import Grid from '@mui/material/Grid'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'


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
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop, noClick: true, maxFiles: 1, accept: { "application/json": [".json"] }
  })

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
              <Grid columnSpacing={1} container sx={{
                flexDirection: { xs: "column", sm: "row" }
              }}>
                <Grid item>
                  <FormHeaderButton {...props} title='list.item.export' action={() => saveAs(new Blob(
                    [JSON.stringify(store)], { type: "application/json;charset=utf-8" }
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
  </SimpleList>
    <MainFooter /></span>
}