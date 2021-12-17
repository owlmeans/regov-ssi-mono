import { TFunction } from 'i18next'
import { ControllerFieldState } from 'react-hook-form'


export const formatError = (t: TFunction, field: string, state: ControllerFieldState) => {
  return t(
    [
      `${field}.error.${state.error?.message || state.error?.type || 'fallback'}`,
      `${field}.error.${state.error?.type || 'fallback'}`,
      state.error?.message || `${field}.error.fallback`,
      `error.${state.error?.type}`
    ],
    {
      ...(state.error?.message
        ? {
          message: t([
            `${field}.error.message.${state.error?.message}`,
            state.error?.message
          ])
        }
        : {}
      )
    }
  )
}