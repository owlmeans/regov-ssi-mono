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


import { EntityContext, EntityProps } from './types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'


export const EntityRenderer = <Subject extends {}>({ t, title, entity, children, subject }: EntityProps<Subject>) => {
  return <EntityContext.Provider value={{ subject, entity, t }}><Card>
    <CardHeader title={title || `${t(`${entity}.title`)}`} />
    <CardContent>
      <Grid container direction="column" justifyContent="center" alignItems="stretch">
        {children}
      </Grid>
    </CardContent>
  </Card>
  </EntityContext.Provider>
}