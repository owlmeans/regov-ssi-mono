import React from 'react'
import { Card, CardContent, CardHeader, Grid } from '@mui/material'
import { EntityContext, EntityProps } from './types'


export const EntityRenderer = <Subject extends {}>({ t, title, entity, children, subject }: EntityProps<Subject>) => {
  return <EntityContext.Provider value={{ subject, entity, t }}><Card>
    <CardHeader title={title || t(`${entity}.title`)} />
    <CardContent>
      <Grid container direction="column" justifyContent="center" alignItems="stretch">
        {children}
      </Grid>
    </CardContent>
  </Card>
  </EntityContext.Provider>
}