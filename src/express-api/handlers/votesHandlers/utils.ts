import { toSubsocialAddress } from "@subsocial/utils"
import { readFileSync } from "fs"
import { join } from "path"
import { stateDirPath } from "../../../utils"

const parseJsonFromState = (fileName: string) => JSON.parse(readFileSync(join(stateDirPath, fileName)).toString())

const contributors = parseJsonFromState('contributors.json')
const investors = parseJsonFromState('investors.json')

export const accountFromSnapshot = (account: string) => {
  const key = toSubsocialAddress(account)
  const amount = contributors[key] || investors[key]

  if (!amount) return undefined

  return {
    account,
    amount
  }
}