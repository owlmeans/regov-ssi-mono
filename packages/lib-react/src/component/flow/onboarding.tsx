import { EXTESNION_TRIGGER_AUTHENTICATED } from '@owlmeans/regov-ssi-extension'
import React, {
  Fragment,
  FunctionComponent,
  useEffect
} from 'react'
import {
  RegovCompoentProps,
  useRegov,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const OnboardingFlow: FunctionComponent<OnboardingFlowParams> = withRegov<OnboardingFlowProps>(
  'OnboardingFlow', props => {
    const { extensions, handler } = useRegov()
    useEffect(() => {
      if (handler.wallet && extensions?.triggerEvent) {
        extensions.triggerEvent(handler.wallet, EXTESNION_TRIGGER_AUTHENTICATED)
      }
    }, [props.alias])
    return <Fragment />
  },
  {
    namespace: 'regov-wallet-flow',
    transformer: (wallet) => {
      return { alias: wallet?.store.alias }
    }
  }
)

export type OnboardingFlowParams = {}

export type OnboardingFlowState = {
  alias: string | undefined
}

export type OnboardingFlowProps = RegovCompoentProps<
  OnboardingFlowParams, OnboardingFlowImplParams, OnboardingFlowState
>

export type OnboardingFlowImplParams = {}

export type OnboardingFlowImplProps = WrappedComponentProps<OnboardingFlowImplParams, OnboardingFlowState>