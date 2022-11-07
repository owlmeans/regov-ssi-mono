
export const reviveJson = (_: string, value: any) => {
  if (value === null || value === undefined) {
    return ""
  }

  return value
}