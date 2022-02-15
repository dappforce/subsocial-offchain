import { toSubsocialAddress } from '@subsocial/utils'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { stateDirPath } from '../../../utils'

const parseJsonFromState = (fileName: string) => {
  const path = join(stateDirPath, fileName)

  if (!existsSync(path)) return []

  return JSON.parse(readFileSync(path).toString())
}

const sources = ['contributors', 'token-claimers', 'subbaner-owners', 'ambassadors']

const eligibleAccountsSet = new Set()

sources
  .map((filename) => filename + '.json')
  .flatMap(parseJsonFromState)
  .forEach((account) => {
    try {
      // Wrapping this line into try/catch, because if some account addresses are be invalid
      // then the whole app will fail with a parsing error.
      eligibleAccountsSet.add(toSubsocialAddress(account))
    } catch (err) {
      // It's OK.
    }
  })

export const isAccountFromSnapshot = (account: string) => {
  const key = toSubsocialAddress(account)

  return eligibleAccountsSet.has(key)
}
