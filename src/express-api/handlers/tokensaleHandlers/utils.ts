import { toSubsocialAddress } from '@subsocial/utils'
import { stateDirPath } from '../../../utils'
import { readSources, withSubsocialAddress } from '../utils'

const eligibleAccountsSet = new Set()
const sourceFolder = 'tokensale'
const sourcePath = `${stateDirPath}/${sourceFolder}`

export const readTokenSaleSources = () => {
  readSources(sourcePath).forEach((account) => {
    try {
      // Wrapping this line into try/catch, because if some account addresses are be invalid
      // then the whole app will fail with a parsing error.
      eligibleAccountsSet.add(toSubsocialAddress(account))
    } catch {
      // It's OK.
    }
  })
}

export const isAccountFromSnapshot = withSubsocialAddress((key) => eligibleAccountsSet.has(key))
