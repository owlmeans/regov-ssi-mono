
export const validateJson = (v: string) => {
  try {
    const tmp = JSON.parse(v)
    if (typeof tmp === 'object') {
      return true
    }
  } catch (e) {
    return false
  }

  return true
}