import { Activity, Counts } from '@subsocial/types'
import BN from 'bn.js'

export type ActivitiesParams = {
  account: string,
  offset: number,
  limit: number
}

export type ActivitiesParamsWithAccount = InsertActivityResponse & {
  blockNumber: BN
  eventIndex: number
  account: string
}

export type InsertActivityResponse = {
  blockNumber: BN
  eventIndex: number
}

export type InsertActivityPromise = Promise<InsertActivityResponse>

export type GetActivitiesFn = (params: ActivitiesParams) => Promise<Activity[]>

export type GetCountFn = (account: string) => Promise<number>

export type GetCountsFn = (account: string) => Promise<Counts>
