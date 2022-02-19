import { Extension, ValidationResult, VALIDATION_FAILURE_CHECKING } from '@owlmeans/regov-ssi-extension'
import { Credential, getCompatibleSubject } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { DialogContent, DialogTitle, Grid, IconButton, Paper } from '@mui/material'
import { REGOV_EXT_SIGNATURE_NAMESPACE, SignatureSubject } from '../../types'
import { CredentialEvidenceWidget, EmptyProps, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { BorderColor, Close } from '@mui/icons-material'
import { REGOV_CREDENTIAL_TYPE_SIGNATURE } from '../../types'
import { dateFormatter, EntityRenderer, EntityTextRenderer, ValidationResultWidget } from '@owlmeans/regov-mold-wallet-web'
import { typeFormatterFacotry } from '../formatter'


export const SignatureView: FunctionComponent<SignatureViewParams> = withRegov<SignatureViewProps>({
  namespace: REGOV_EXT_SIGNATURE_NAMESPACE
}, ({ t, credential, close, ext }) => {
  const { handler, extensions } = useRegov()
  const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
  const subject = getCompatibleSubject<SignatureSubject>(credential)

  const [counter, setCounter] = useState<number>(0)
  const reload = () => setCounter(counter + 1)

  const [result, setValidationResult] = useState<ValidationResult>({
    valid: false,
    trusted: false,
    cause: VALIDATION_FAILURE_CHECKING,
    evidence: []
  })

  useEffect(() => {
    (async () => {
      if (!handler.wallet || !extensions) {
        return
      }
      const res = await factory.validationFactory(handler.wallet, {
        credential, extensions: extensions.registry
      })
      setValidationResult(res)
    })()
  }, [credential.id, counter])

  return <Fragment>
    <DialogTitle>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item xs={8}>
          {t('signature.view.title', { name: subject.name })}
        </Grid>
        <Grid item xs={4} container direction="row" justifyContent="flex-end" alignItems="flex-start">
          <Grid item>
            {close && <IconButton onClick={close}><Close /></IconButton>}
          </Grid>
        </Grid>
      </Grid>
    </DialogTitle>
    <DialogContent dividers={true}>
      <Grid container direction="column" justifyContent="flex-start" alignItems="stretch">
        <Grid item container direction="row" justifyContent="space-between" alignItems="stretch">
          <Grid item xs={12} sm={6} md={7} px={1}>
            <Paper elevation={3}>
              <EntityRenderer t={t} entity="signature.view" title={
                <Fragment>
                  <Grid container direction="row" spacing={1} justifyContent="flex-start" alignItems="flex-start">
                    <Grid item>
                      <BorderColor fontSize="large" />
                    </Grid>
                    <Grid item>{subject.name}</Grid>
                  </Grid>
                </Fragment>
              } subject={subject}>
                {subject.description.trim() !== "" && <EntityTextRenderer field="description" showLabel />}
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
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={5} px={1}>
            <Paper elevation={3}>
              <ValidationResultWidget result={result} reload={reload} />
            </Paper>
          </Grid>
        </Grid>
        <Grid item pt={1} px={1}>
          <CredentialEvidenceWidget credential={credential} />
        </Grid>
      </Grid>
    </DialogContent>
  </Fragment>
})

export type SignatureViewParams = EmptyProps & {
  ext: Extension
  close: () => void
  credential: Credential
}

export type SignatureViewProps = RegovComponentProps<SignatureViewParams>