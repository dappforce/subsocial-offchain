import { ActivitiesParams, GetActivityFn, GetCountFn } from "../types"
import { Activity } from "@subsocial/types"
import { getQuery } from "../utils"

const activityQuery = 
  `SELECT DISTINCT * 
    FROM df.activities
    WHERE account = $1
    ORDER BY date DESC
    OFFSET $2
    LIMIT $3`

const activityCountQuery = 
  `SELECT COUNT(*)
    FROM df.activities
    WHERE account = $1`

const getActivitiesFrom = ({ account, offset, limit }: ActivitiesParams): Promise<Activity[]> => getQuery(
  activityQuery,
  [ account, offset, limit ],
  `Failed to load to activities by account ${account}`)

const getCountFrom = async (account: string) => {
  const data = await getQuery(
    activityCountQuery,
    [ account ],
    `Failed to count activities by account ${account}`)

  return data.pop().count
}

export const getActivitiesData: GetActivityFn = (params) => getActivitiesFrom(params)
export const getActivitiesCount: GetCountFn = (params) => getCountFrom(params)