import { Card, Button, CardContent, CardHeader, Grid, makeStyles, Paper, Typography } from "@material-ui/core"
import { compose } from "@reduxjs/toolkit"
import { EncryptedStore } from "metabelarusid-core"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { connect, ConnectedProps } from "react-redux"
import { RouteComponentProps, withRouter } from "react-router"
import { storeActions } from "../../store"
import { RootState } from "../../store/types"


const connector = connect(
  ({ store: { stores } }: RootState, props) => {
    return {
      stores,
      ...props
    }
  },
  (dispatch, props) => {
    return {
      addStore: (store: EncryptedStore) => {
        dispatch(storeActions.add(store))
      },
      ...props
    }
  }
)

export const StoreImport = compose(withRouter, connector)(
  ({ stores, addStore, history }: RouteComponentProps & ConnectedProps<typeof connector>) => {
    const classes = useStyles()
    const onDrop = useCallback(async (files: File[]) => {
      let successCounter = 0
      const waiters: { waiter: Promise<void>, resolver: Function, rejector: Function }[] = []
      files.forEach(file => {
        let resolver: Function = undefined
        let rejector: Function = undefined
        const waiter = {
          waiter: new Promise<void>((resolve, reject) => {
            resolver = resolve
            rejector = reject
          }),
          resolver: () => resolver(),
          rejector: () => rejector()
        }
        waiters.push(waiter)
        if (!file.name.match(/\.metaid$/)) {
          alert('Файл должен иметь расширение .metaid')
          waiter.rejector()
          return
        }
        if (file.size > 1000000) {
          alert('Файл не может быть слишком большим')
          waiter.rejector()
          return
        }

        const reader = new FileReader()

        reader.onabort = () => {
          alert('Чтение файла было отменено')
          waiter.rejector()
        }
        reader.onerror = () => {
          alert('Не получилось прочитать файл')
          waiter.rejector()
        }

        reader.onload = () => {
          try {
            const store = JSON.parse(reader.result as string) as EncryptedStore

            if (!store.alias || !store.dataChunks || !store.name) {
              alert('Данные содержащиеся в файле имеют неверный формат')
              waiter.rejector()
              return
            }

            if (stores[store.alias]) {
              alert('На устройстве уже есть кошелёк с таким именем')
              waiter.rejector()
              return
            }

            addStore(store)

            successCounter++
            waiter.resolver()
          } catch (e) {
            console.log(e)
            alert('Файл поврежден или не является тем чем пытается казаться')
            waiter.rejector()
            return
          }
        }
        reader.readAsText(file)
      })

      await Promise.allSettled(waiters.map(waiter => waiter.waiter))
      if (successCounter > 0) {
        history.push('/store')
      } else {
        alert('Не удалось ничего загрузить')
      }
    }, [stores, addStore, history])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    return <Card>
      <CardHeader title="Импортировать кошелёк" action={
        <Button variant="contained" size="small"
          onClick={() => history.push('/store')}>К списку</Button>
      } />
      <CardContent>
        <Paper>
          <Grid container className={classes.dropzone}
            direction="column"
            justifyContent="center"
            alignItems="center"
            {...getRootProps()}>
            <input {...getInputProps()} />
            <Grid container item
              direction="row"
              justifyContent="center"
              alignItems="stretch">
              <Grid item>
                <Typography>Переместите сюда файл или нажмите на эту область</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </CardContent>
    </Card>
  }
)

const useStyles = makeStyles({
  dropzone: {
    height: "20em"
  }
})