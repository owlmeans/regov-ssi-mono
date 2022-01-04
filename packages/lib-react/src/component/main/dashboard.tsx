import React, {
  FunctionComponent
} from 'react'
import {
  RegovCompoentProps,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const MainDashboard: FunctionComponent<MainDashboardParams> = withRegov<
  MainDashboardProps
>('MainDashboard', props => {
  const _props: MainDashboardImplProps = {
    t: props.t,

    i18n: props.i18n
  }

  return <props.renderer {..._props} />
}, { namespace: 'regov-wallet-main' })

export type MainDashboardProps = RegovCompoentProps<MainDashboardParams, MainDashboardImplParams>

export type MainDashboardParams = {}

export type MainDashboardImplParams = {}

export type MainDashboardImplProps = WrappedComponentProps<MainDashboardImplParams>