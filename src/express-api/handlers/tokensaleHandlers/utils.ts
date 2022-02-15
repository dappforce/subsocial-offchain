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
    eligibleAccountsSet.add(toSubsocialAddress(account))
  })

export const isAccountFromSnapshot = (account: string) => {
  const key = toSubsocialAddress(account)

  return eligibleAccountsSet.has(key)
}
