import React, { 
  FunctionComponent, 
  useState, 
  Fragment 
} from 'react'
import {
  Grid,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import {
  EmptyProps,
  MainModalEventTriggerParams,
  RegovCompoentProps,
  withRegov
} from '@owlmeans/regov-lib-react'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../types'
import { FormMainButton } from '@owlmeans/regov-mold-wallet-web'
import { IdentityCreation } from './identity'


export const Onboarding: FunctionComponent<OnboardingParams> =
  withRegov<OnboardingProps>({ namespace: REGOV_IDENTITY_DEFAULT_NAMESPACE }, props => {
    const { t, ns } = props

    const [activeStep, setActiveStep] = useState(0)

    return <Fragment>
      <DialogTitle>
        <Stepper activeStep={activeStep}>
          <Step>
            <StepLabel><Typography variant='h6'>{t('step.welcom.label')}</Typography></StepLabel>
          </Step>
          <Step>
            <StepLabel><Typography variant='h6'>{t('step.initialize.label')}</Typography></StepLabel>
          </Step>
          <Step>
            <StepLabel><Typography variant='h6'>{t('step.finish.label')}</Typography></StepLabel>
          </Step>
        </Stepper>
      </DialogTitle>
      <DialogContent>
        {0 === activeStep && <Fragment>
          <Typography variant='h5'>{t('step.welcom.title')}</Typography>
          <Typography variant='body1'>{t('step.welcom.why')}</Typography>
          <Typography variant='body1'>{t('step.welcom.note')}</Typography>
          <Typography variant='body1'>{t('step.welcom.oppotunities.title')}</Typography>
          <ul>
            <li><Typography variant='subtitle1'>{t('step.welcom.oppotunities.op1')}</Typography></li>
            <li><Typography variant='subtitle1'>{t('step.welcom.oppotunities.op2')}</Typography></li>
            <li><Typography variant='subtitle1'>{t('step.welcom.oppotunities.op3')}</Typography></li>
            <li><Typography variant='subtitle1'>{t('step.welcom.oppotunities.op4')}</Typography></li>
            <li><Typography variant='subtitle1'>{t('step.welcom.oppotunities.op5')}</Typography></li>
          </ul>
        </Fragment>}
        {1 === activeStep && <IdentityCreation {...props} ns={ns}/>}
      </DialogContent>
      <DialogActions>
        <Grid container direction="row" justifyContent="flex-end" alignItems="stretch">
          {0 === activeStep && <Grid item>
            <FormMainButton {...props} title="step.general.next" action={() => setActiveStep(1)} />
          </Grid>}
        </Grid>
      </DialogActions>
    </Fragment>
  })

export type OnboardingParams = MainModalEventTriggerParams & EmptyProps

export type OnboardingProps = RegovCompoentProps<OnboardingParams>