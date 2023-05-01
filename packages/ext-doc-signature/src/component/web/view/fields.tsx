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

import React, { FunctionComponent, PropsWithChildren } from "react"

import { dateFormatter, EmptyProps, EntityRenderer, EntityTextRenderer } from "@owlmeans/regov-lib-react"
import { TFunction } from "react-i18next"
import { SignatureCredential } from "../../../types"
import { typeFormatterFacotry } from "../../formatter"

import Grid from "@mui/material/Grid"
import BorderColor from "@mui/icons-material/BorderColor"


export const SignatureViewFieldsWeb: FunctionComponent<SignatureViewFieldsWebProps> = props => {
  const { t, cred } = props
  const subject = cred.credentialSubject

  return <EntityRenderer t={t} entity="signature.view" title={
    <Grid container direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
      <Grid item>
        <BorderColor fontSize="large" />
      </Grid>
      <Grid item>{subject.name}</Grid>
    </Grid>
  } subject={subject}>
    {subject.description?.trim() !== "" && <EntityTextRenderer field="description" showLabel />}
    <EntityTextRenderer field="documentHash" small showLabel />
    {subject.filename?.trim() !== "" && <EntityTextRenderer field="filename" showLabel />}
    {subject.url?.trim() !== "" && <EntityTextRenderer field="url" showLabel />}
    {subject.authorId?.trim() !== "" && <EntityTextRenderer field="authorId" showLabel />}
    <Grid item container direction="row" justifyContent="space-between" alignItems="flex-start">
      <EntityTextRenderer field="signedAt" showHint small netSize={6} formatter={dateFormatter} />
      <EntityTextRenderer field="docType" showHint small netSize={6} formatter={typeFormatterFacotry(t)} />
    </Grid>
    <Grid item container direction="row" justifyContent="space-between" alignItems="flex-start">
      <EntityTextRenderer field="creationDate" showHint small netSize={6} formatter={dateFormatter} />
      {subject.version?.trim() !== "" && <EntityTextRenderer field="version" showHint small netSize={6} />}
    </Grid>
  </EntityRenderer>
}

export type SignatureViewFieldsWebProps = PropsWithChildren<EmptyProps & {
  t: TFunction
  cred: SignatureCredential
}>