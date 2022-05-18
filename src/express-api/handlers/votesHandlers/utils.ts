import { toSubsocialAddress } from '@subsocial/utils'
import { stateDirPath } from '../../../utils'
import { readSources, withSubsocialAddress } from '../utils'

const eligibleAccountsMap = new Map<string, string>()
const sourceFolder = 'polls'
const sourcePath = `${stateDirPath}/${sourceFolder}`

export const readPollsSources = () => {
  readSources(sourcePath).forEach((data) => {
    const dataEntries = Object.entries(data)

    dataEntries.forEach(([account, amount]) => {
      try {
        // Wrapping this line into try/catch, because if some account addresses are be invalid
        // then the whole app will fail with a parsing error.
        eligibleAccountsMap.set(toSubsocialAddress(account), amount as string)
      } catch {
        // It's OK.
      }
    })
  })
}

export const isAccountEligibleForVote = withSubsocialAddress<boolean>((key) =>
  eligibleAccountsMap.has(key)
)

export const getAmountByAccountForVote = withSubsocialAddress<string>((key) =>
  eligibleAccountsMap.get(key)
)
