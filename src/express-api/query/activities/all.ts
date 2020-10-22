import { ActivitiesParams, GetActivitiesFn, GetCountFn } from "../types"
import { Activity } from "@subsocial/types"
import { execPgQuery } from "../utils"

const pageQuery = 
  `SELECT DISTINCT * 
    FROM df.activities
    WHERE account = $1
    ORDER BY date DESC
    OFFSET $2
    LIMIT $3`

const countQuery = 
  `SELECT COUNT(*)
    FROM df.activities
    WHERE account = $1`

const queryPage = (params: ActivitiesParams): Promise<Activity[]> => {
  const { account, offset, limit } = params
  return execPgQuery(
    pageQuery,
    [ account, offset, limit ],
    `Failed to load to activities by account ${account}`
  )
}

const queryCount = async (account: string) => {
  const data = await execPgQuery(
    countQuery,
    [ account ],
    `Failed to count activities by account ${account}`
  )
  return data.pop().count
}

export const getActivitiesData: GetActivitiesFn = (params) => queryPage(params)

export const getActivitiesCount: GetCountFn = (params) => queryCount(params)
