import * as express from 'express'
import { nonEmptyStr, parseNumStr } from '@subsocial/utils';
import { GetActivityFn, GetCountFn, getFeedData, getNotificationsData, getFeedCount, getNotificationsCount, getActivitiesData, getActivitiesCount } from './query';

const RESULT_LIMIT = parseNumStr(process.env.PGLIMIT) || 20

const getNumberValueFromRequest = (req: express.Request, value: 'limit' | 'offset', def: number): number => {
  const reqLimit = req.query[value]
  return nonEmptyStr(reqLimit) ? parseNumStr(reqLimit) : def
}

const getLimitFromRequest = (req: express.Request): number => { 
  const limit = getNumberValueFromRequest(req, 'limit', RESULT_LIMIT)
  return limit < RESULT_LIMIT ? limit : RESULT_LIMIT
}

const getOffsetFromRequest = (req: express.Request): number => getNumberValueFromRequest(req, 'offset', 0)

const innerHandler = async (_req: express.Request, res: express.Response, method: Promise<any>) => {
  try {
    const data = await method
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
}

const activityHandler = (req: express.Request, res: express.Response, method: GetActivityFn) => {
  const limit = getLimitFromRequest(req);
  const offset = getOffsetFromRequest(req);
  const account = req.params.id;

  return innerHandler(req, res, method({ account, limit, offset }))
}

export const feedHandler = (req: express.Request, res: express.Response) => activityHandler(req, res, getFeedData)
export const notificationsHandler = (req: express.Request, res: express.Response) => activityHandler(req, res, getNotificationsData)
export const activitiesHandler = (req: express.Request, res: express.Response) => activityHandler(req, res, getActivitiesData)

const countHandler = async  (req: express.Request, res: express.Response, method: GetCountFn) => {
  const account = req.params.id;

  return innerHandler(req, res, method(account))
}

export const feedCountHandler = (req: express.Request, res: express.Response) => countHandler(req, res, getFeedCount)
export const notificationsCountHandler = (req: express.Request, res: express.Response) => countHandler(req, res, getNotificationsCount)
export const activitiesCountHandler = (req: express.Request, res: express.Response) => countHandler(req, res, getActivitiesCount)