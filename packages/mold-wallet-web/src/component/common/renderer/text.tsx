import React, { Fragment } from 'react'
import {
  EntityItemProps,
  EntityContextConsumer
} from './types'
import {
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputLabel,
  Typography
} from '@mui/material'
import { getDeepValue } from '@owlmeans/regov-ssi-common'
import { OutputFieldFormatter } from '../field'
import { TFunction } from 'i18next'


export const EntityTextRenderer = ({
  t, showIntro, inlineLabel, showLabel, showHint, netSize,
  entity, field, value, formatter, formatTemplate, small
}: EntityTextProps) => {
  const showIntroLabel = !inlineLabel && showLabel
  const useInlinedLabel = inlineLabel || (!showIntroLabel && showLabel)

  return value && value !== '' ?<Grid item xs={netSize || 12}>
    <EntityContextConsumer>
      {({ subject, entity: _entity, t: _t }) => {
        value = value || getDeepValue(subject || {}, field) || ''
        t = t || _t as TFunction
        entity = entity || _entity
        return <FormControl focused fullWidth margin="normal" variant="standard" size={small ? "small" : "medium"}>
          {(showIntro || showIntroLabel) && <InputLabel htmlFor={`${entity}.${field}.output`}>
            {showIntro ? t(`${entity}.${field}.intro`) : showIntroLabel ? t(`${entity}.${field}.label`) : ''}
          </InputLabel>}
          <Input readOnly disableUnderline id={`${entity}.${field}.output`}
            size={small ? "small" : "medium"}
            sx={small ? { fontSize: 10 } : {}}
            startAdornment={
              useInlinedLabel && <Typography color="primary" marginRight={1} variant="subtitle1">
                {t(`${field}.label`)}:
              </Typography>
            } value={formatter ? formatter(value, formatTemplate) : value} />
          {showHint && <FormHelperText>{t(`${entity}.${field}.hint`)}</FormHelperText>}
        </FormControl>
      }}
    </EntityContextConsumer>
  </Grid> : <Fragment />
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