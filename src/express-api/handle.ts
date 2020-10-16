import * as express from 'express'
import { nonEmptyStr, parseNumStr } from '@subsocial/utils';
import { GetActivityFn, GetCountFn, getFeedData, getNotificationsData, getFeedCount, getNotificationsCount } from './query';

const RESULT_LIMIT = parseNumStr(process.env.PGLIMIT) || 20

const getNumberValueFromRequest = (req: express.Request, value: 'limit' | 'offset'): number => {
  const reqLimit = req.query[value]
  return nonEmptyStr(reqLimit) ? parseNumStr(reqLimit) : RESULT_LIMIT
}

const getLimitFromRequest = (req: express.Request): number => getNumberValueFromRequest(req, 'limit')

const getOffsetFromRequest = (req: express.Request): number => getNumberValueFromRequest(req, 'offset')

const innerHandle = async (_req: express.Request, res: express.Response, method: Promise<any>) => {
  try {
    const data = await method
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
}

const activityHandle = (req: express.Request, res: express.Response, method: GetActivityFn) => {
  const limit = getLimitFromRequest(req);
  const offset = getOffsetFromRequest(req);
  const account = req.params.id;

  return innerHandle(req, res, method({ account, limit, offset }))
}

export const feedHandle = (req: express.Request, res: express.Response) => activityHandle(req, res, getFeedData)
export const notificationsHandle = (req: express.Request, res: express.Response) => activityHandle(req, res, getNotificationsData)

const countHandle = async  (req: express.Request, res: express.Response, method: GetCountFn) => {
  const account = req.params.id;

  return innerHandle(req, res, method(account))
}

export const feedCountHandle = (req: express.Request, res: express.Response) => countHandle(req, res, getFeedCount)
export const notificationsCountHandle = (req: express.Request, res: express.Response) => countHandle(req, res, getNotificationsCount)