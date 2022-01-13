import {
  ManuItemParams,
  MenuActionResult
} from "./types"


export const castMenuItemParams = async (item: ManuItemParams): Promise<MenuActionResult | void> => {
  return typeof item.action === 'function'
    ? await item.action()
    : typeof item.action === 'string'
      ? { path: item.action } : item.action
}