import React, {
  FunctionComponent
} from 'react'
import {
  RegovComponetProps,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const MainDashboard: FunctionComponent<MainDashboardParams> = withRegov<
  MainDashboardProps
>('MainDashboard', props => {
  const { t, i18n } = props
  const _props: MainDashboardImplProps = {
    t, i18n
  }

  return <props.renderer {..._props} />
}, { namespace: 'regov-wallet-main' })

export type MainDashboardProps = RegovComponetProps<MainDashboardParams, MainDashboardImplParams>

export type MainDashboardParams = {}

export type MainDashboardImplParams = {}

export type MainDashboardImplProps = WrappedComponentProps<MainDashboardImplParams>