
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

export const loginAliasValidation = {
  required: true,
  minLength: 3,
  maxLength: 24,
  pattern: /^[\w\d_-]+$/
}

export const passwordValidation = {
  required: true,
  minLength: 8,
  maxLength: 64
}