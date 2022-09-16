import { UseFormReturn } from "react-hook-form"
import { NavigatorLoading, BasicNavigator } from "../common"


export const trySubmit = <
  Data extends {},
  Naviagtor extends BasicNavigator = BasicNavigator
>(params: TrySubmitParams<Data, Naviagtor>, callback: TrySubmitCallback<Data, Naviagtor>) => {
  const { navigator, errorField, methods, onError } = params
  return async (data: Data) => {
    const loader = await navigator.invokeLoading()
    try {
      await callback({ loader, navigator, errorField, methods }, data)
    } catch (e) {
      console.error(e)
      loader.error(e)
      if (onError && await onError({ ...params, loader }, data)) {
        methods && errorField && methods.setError(errorField as any, { type: e.message })
      }
    } finally {
      loader.finish()
    }
  }
}

export type TrySubmitCallabackParams<Data extends {}, Navigator extends BasicNavigator = BasicNavigator> = {
  loader: NavigatorLoading,
  navigator: Navigator,
  methods?: UseFormReturn<Data>,
  errorField?: string
}

export type TrySubmitParams<Data extends {}, Navigator extends BasicNavigator = BasicNavigator> = {
  navigator: Navigator
  onError?: TrySubmitCallback<Data, Navigator>
  errorField?: string
  methods?: UseFormReturn<Data>
}

export type TrySubmitCallback<
  Data extends {},
  Navigator extends BasicNavigator = BasicNavigator
> = (params: TrySubmitCallabackParams<Data, Navigator>, data: Data) => Promise<boolean | void>