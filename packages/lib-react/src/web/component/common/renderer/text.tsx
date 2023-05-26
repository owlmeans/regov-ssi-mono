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

import { Fragment } from 'react'
import { EntityItemProps, EntityContextConsumer } from './types'
import { getDeepValue } from '@owlmeans/regov-ssi-core'
import { OutputFieldFormatter } from '../field'
import { TFunction } from 'i18next'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'


export const EntityTextRenderer = ({
  t, showIntro, inlineLabel, showLabel, showHint, netSize, entity, field, value, formatter, formatTemplate, small
}: EntityTextProps) => {
  const showIntroLabel = !inlineLabel && showLabel
  const useInlinedLabel = inlineLabel || (!showIntroLabel && showLabel)

  return <Grid item xs={netSize || 12}>
    <EntityContextConsumer>
      {({ subject, entity: _entity, t: _t }) => {
        value = value || getDeepValue(subject || {}, field) || ''
        t = t || _t as TFunction
        entity = entity || _entity
        return value && value !== '' ? <FormControl focused fullWidth margin="normal" variant="standard" size={small ? "small" : "medium"}>
          {(showIntro || showIntroLabel) && <InputLabel htmlFor={`${entity}.${field}.output`}>
            {`${showIntro ? t(`${entity}.${field}.intro`) : showIntroLabel ? t(`${entity}.${field}.label`) : ''}`}
          </InputLabel>}
          <Input readOnly disableUnderline id={`${entity}.${field}.output`}
            size={small ? "small" : "medium"}
            sx={small ? { fontSize: 10 } : {}}
            startAdornment={
              useInlinedLabel && <Typography color="primary" marginRight={1} variant="subtitle1">
                {`${t(`${field}.label`)}`}:
              </Typography>
            } value={formatter ? formatter(value, formatTemplate) : value} />
          {showHint && <FormHelperText>{`${t(`${entity}.${field}.hint`)}`}</FormHelperText>}
        </FormControl> : <Fragment />
      }}
    </EntityContextConsumer>
  </Grid>
}

export type EntityTextParams = {
  showIntro?: boolean
  inlineLabel?: boolean
  showLabel?: boolean
  showHint?: boolean
  formatter?: OutputFieldFormatter
  field: string
  value?: string
  small?: boolean
  formatTemplate?: string
  netSize?: number
}

export type EntityTextProps = EntityItemProps<{ [key: string]: any }, EntityTextParams>