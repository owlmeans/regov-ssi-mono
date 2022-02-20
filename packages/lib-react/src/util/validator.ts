
export const validateJsonOrEmpty = (v: string) => {
  if (v === '') {
    return true
  }

  return validateJson(v)
}

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

export const humanReadableVersion = {
  maxLength: 128,
  pattern: /^[\w\d\s\._-]*$/
}

export const generalNameVlidation = (required: boolean = true) => ({
  required,
  maxLength: 32,
  validate: {
    pattern: (v: string) => !v.match(/[\<\>\[\]\{\}\\\']/)
  }
})
export const generalIdVlidation = (required: boolean = true) => ({
  required,
  maxLength: 1024
})

export const urlVlidation = (required: boolean = false) => ({
  validate: {
    url: (v: string) => {
      if (!required && v === '') {
        return true
      }
      
      try {
        new URL(v)
      } catch (e) {
        return false
      }

      return true
    }
  }
})

