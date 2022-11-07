/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


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

export const didValidation = {
  required: true,
  minLength: 10,
  maxLength: 128,
  pattern: /^did\:\w+\:.+/
}

export const humanReadableVersion = {
  maxLength: 128,
  pattern: /^[\w\d\s\._-]*$/
}

export const generalNameVlidation = (required: boolean = true) => ({
  required,
  maxLength: 96,
  validate: {
    pattern: (v: string) => !v.match(/[\<\>\[\]\{\}\\\']/)
  }
})

export const generalIdVlidation = (required: boolean = true) => ({
  required,
  maxLength: 1024
})

export const generalDidIdValidation = (required: boolean = true) => ({
  required,
  maxLength: 2028,
  validate: {
    pattern: (v: string) => v.startsWith('did:')
  }
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

