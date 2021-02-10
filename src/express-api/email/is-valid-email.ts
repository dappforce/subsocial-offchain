// FIXME: export these to JS libs
import { isEmptyStr } from "@subsocial/utils"
import { parseEmail } from "./format-email"

const validEmailProviders = [
  'gmail.com',
  'google.com',
  'yahoo.com',
  'protonmail.com',
  'hotmail.com',
  'outlook.com',
  'msn.com',
  'live.com',
  'aol.com',
  'yandex.com',
  'mail.ru'
]

const validEmailSet = new Set(validEmailProviders)

export const isValidEmailProvider = (email?: string) => {
  if (!email || isEmptyStr(email)) return false

  const [ , domain ] = parseEmail(email)

  return validEmailSet.has(domain)
}