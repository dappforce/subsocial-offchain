import { Activity } from '@subsocial/types'

export type ActivitiesParams = {
  account: string,
  offset: number,
  limit: number
}

export type GetActivityFn = (params: ActivitiesParams) => Promise<Activity[]>
export type GetCountFn = (account: string) => Promise<number>
