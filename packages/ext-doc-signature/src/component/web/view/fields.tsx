import React, { FunctionComponent, PropsWithChildren } from "react"
import { dateFormatter, EmptyProps, EntityRenderer, EntityTextRenderer } from "@owlmeans/regov-lib-react"
import { TFunction } from "react-i18next"
import Grid from "@mui/material/Grid"
import BorderColor from "@mui/icons-material/BorderColor"
import { SignatureCredential } from "../../../types"
import { typeFormatterFacotry } from "../../formatter"


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