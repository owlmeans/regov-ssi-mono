import { Dialog, DialogContent, FormControl, FormHelperText, Grid, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material'
import { CredentialWrapper } from '@owlmeans/regov-ssi-core'
import { TFunction } from 'i18next'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'


export const CredentialSelector = (
  { t, field, defaultId, credentials, itemRenderer: Renderer }: CredentialSelectorProps
) => {
  const { control, setValue, watch } = useFormContext()
  const [open, setOpen] = useState<boolean>(false)
  defaultId = defaultId || (credentials.length > 0 ? credentials[0].credential.id : undefined)

  const currentValue = watch(field)

  const selected = credentials.find(cred =>
    currentValue ? cred.credential.id === currentValue : cred.credential.id === defaultId
  )
  const selectedId = selected?.credential.id

  useEffect(() => {
    if (currentValue !== selectedId) {
      setValue(field, selectedId)
    }
  }, [selectedId, currentValue, defaultId])

  // 

  return credentials.length > 0
    ? <Fragment>
      <Grid item onClick={() => setOpen(true)} style={{ cursor: "pointer" }}
        border={1} borderColor="info.dark" borderRadius={2} px={2}>
        <Controller name={field} control={control} render={() => {
          return selected && selectedId
            ? Renderer
              ? <Renderer t={t} credential={selected} selectedId={selectedId} />
              : <FormControl focused fullWidth margin="normal" variant="filled">
                <Typography color="info.dark">{`${selected.meta.title}`}</Typography>
                <Typography>{selected.credential.id}</Typography>
                <FormHelperText>{t(`${field}.hint`)}</FormHelperText>
              </FormControl>
            : <Fragment>
              <Typography>{t(`${field}.pleaseSelect`)}</Typography>
            </Fragment>
        }} />
      </Grid>
      <Dialog open={open} scroll="paper" onClose={() => setOpen(false)}>
        <DialogContent>
          <List>
            {credentials.map((credential, idx) =>
              <ListItem key={credential.credential.id || idx}>
                {
                  Renderer
                    ? <Renderer t={t} credential={credential} selectedId={selectedId} />
                    : <ListItemButton onClick={() => {
                      setValue(field, credential.credential.id)
                      setOpen(false)
                    }}>
                      <ListItemText primary={credential.meta.title} secondary={credential.credential.id} />
                    </ListItemButton>
                }
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Fragment>
    : <Grid item>
      <FormControl focused fullWidth margin="normal" variant="standard" error={true}>
        <Typography variant="h5" color="error">
          {t(`${field}.noItems`)}
        </Typography>
      </FormControl>
    </Grid>
}

export type CredentialSelectorProps = {
  t: TFunction
  field: string
  defaultId?: string
  itemRenderer?: FunctionComponent<CredentialSelectorItemRendererProps>
  credentials: CredentialWrapper[]
}

export type CredentialSelectorItemRendererProps = {
  t: TFunction
  credential: CredentialWrapper
  selectedId?: string
}