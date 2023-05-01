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

import React, { FunctionComponent, useState, Fragment } from 'react'
import {
  EmptyProps, FormHeaderButton, MainModalAuthenticatedEventParams, RegovComponentProps, useRegov, withRegov
} from '@owlmeans/regov-lib-react'
import { REGOV_IDENTITY_DEFAULT_NAMESPACE } from '../../types'
import { FormMainButton } from '@owlmeans/regov-lib-react'
import { IdentityCreation, IdentityCreationProceedHandle } from './identity'
import { isMobile, isBrowser } from 'react-device-detect'
import Grid from '@mui/material/Grid'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import MobileStepper from '@mui/material/MobileStepper'


export const Onboarding: FunctionComponent<OnboardingParams> =
  withRegov<OnboardingProps>({ namespace: REGOV_IDENTITY_DEFAULT_NAMESPACE }, props => {
    const { handler } = useRegov()
    const { t, ns, handle } = props

    const [activeStep, setActiveStep] = useState(0)

    const proceedHandle: IdentityCreationProceedHandle = {}

    return <Fragment>
      {isBrowser && <DialogTitle>
        <Stepper activeStep={activeStep}>
          <Step>
            <StepLabel><Typography variant='h6'>{`${t('step.welcom.label')}`}</Typography></StepLabel>
          </Step>
          <Step>
            <StepLabel><Typography variant='h6'>{`${t('step.initialize.label')}`}</Typography></StepLabel>
          </Step>
          <Step>
            <StepLabel><Typography variant='h6'>{`${t('step.finish.label')}`}</Typography></StepLabel>
          </Step>
        </Stepper>
      </DialogTitle>}
      <DialogContent>
        {0 === activeStep && <Fragment>
          <Typography variant='h5'>{`${t('step.welcom.title')}`}</Typography>
          <Typography variant='body1'>{`${t('step.welcom.why')}`}</Typography>
          <Typography variant='body1'>{`${t('step.welcom.note')}`}</Typography>
          <Typography variant='body1'>{`${t('step.welcom.oppotunities.title')}`}</Typography>
          <ul>
            <li><Typography variant='subtitle1'>{`${t('step.welcom.oppotunities.op1')}`}</Typography></li>
            <li><Typography variant='subtitle1'>{`${t('step.welcom.oppotunities.op2')}`}</Typography></li>
            <li><Typography variant='subtitle1'>{`${t('step.welcom.oppotunities.op3')}`}</Typography></li>
            <li><Typography variant='subtitle1'>{`${t('step.welcom.oppotunities.op4')}`}</Typography></li>
            <li><Typography variant='subtitle1'>{`${t('step.welcom.oppotunities.op5')}`}</Typography></li>
          </ul>
        </Fragment>}
        {1 === activeStep && <IdentityCreation {...props} ns={ns} proceedHandle={proceedHandle} />}
        {2 === activeStep && <Fragment>
          <Typography variant='h5'>{`${t('step.finish.title')}`}</Typography>
          <Typography variant='body1'>{`${t('step.finish.congratulation')}`}</Typography>
        </Fragment>}
      </DialogContent>
      <DialogActions>
        {isMobile
          ? <MobileStepper activeStep={activeStep} variant="dots" steps={3}
            position="static" sx={{ width: window.innerWidth * 0.8 }} nextButton={
              activeStep < 2
                ? <FormHeaderButton {...props} title="step.general.next"
                  action={() => 0 === activeStep
                    ? setActiveStep(1)
                    : proceedHandle.proceed && proceedHandle.proceed(() => setActiveStep(2))
                  } />
                : <FormHeaderButton {...props} title="step.finish.finish" action={() => {
                  handler.notify()
                  handle.setOpen && handle.setOpen(false)
                }} />
            } backButton={<Fragment />} />
          : <Grid container direction="row" justifyContent="flex-end" alignItems="stretch">
            {0 === activeStep && <Grid item>
              <FormMainButton {...props} title="step.general.next" action={() => setActiveStep(1)} />
            </Grid>}
            {1 === activeStep && <Grid item>
              <FormMainButton {...props} title="step.general.next" action={() =>
                proceedHandle.proceed && proceedHandle.proceed(() => setActiveStep(2))
              } />
            </Grid>}
            {2 === activeStep && <Grid item>
              <FormMainButton {...props} title="step.finish.finish" action={() => {
                handler.notify()
                handle.setOpen && handle.setOpen(false)
              }} />
            </Grid>}
          </Grid>}
      </DialogActions>
    </Fragment>
  })

export type OnboardingParams = MainModalAuthenticatedEventParams & EmptyProps

export type OnboardingProps = RegovComponentProps<OnboardingParams>