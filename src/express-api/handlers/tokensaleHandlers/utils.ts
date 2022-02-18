import { toSubsocialAddress } from '@subsocial/utils'
import { readFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import { stateDirPath } from '../../../utils'

const eligibleAccountsSet = new Set()
const sourceFolder = 'tokensale'
const sourcePath = `${stateDirPath}/${sourceFolder}`

const parseJsonFromState = (fileName: string) => {
  const path = join(sourcePath, fileName)

  if (!existsSync(path)) return []

  return JSON.parse(readFileSync(path).toString())
}

export const readTokenSaleSources = () => {

  if (!existsSync(sourcePath)) {
    mkdirSync(sourcePath)
  }

  const files = readdirSync(sourcePath)

  files
    .flatMap(parseJsonFromState)
    .forEach((account) => {
      try {
        // Wrapping this line into try/catch, because if some account addresses are be invalid
        // then the whole app will fail with a parsing error.
        eligibleAccountsSet.add(toSubsocialAddress(account))
      } catch {
        // It's OK.
      }
    })
  
}

export const isAccountFromSnapshot = (account: string) => {
  const key = toSubsocialAddress(account)

  return eligibleAccountsSet.has(key)
}
