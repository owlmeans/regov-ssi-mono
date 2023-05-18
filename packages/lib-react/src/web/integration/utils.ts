
let _password: string | undefined = undefined

export const isRegovPasswordSet = () => _password !== undefined

export const setRegovPassword = (password: string) => (_password = password)

export const getRegovPassword = () => _password
