import * as express from 'express'
import { nonEmptyStr, parseNumStr } from '@subsocial/utils';
import { GetActivityFn, GetCountFn, getFeedData, getNotificationsData, getFeedCount, getNotificationsCount } from './query';

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

const innerHandleR = async (_req: express.Request, res: express.Response, method: Promise<any>) => {
  try {
    const data = await method
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
}

const activityHandleR = (req: express.Request, res: express.Response, method: GetActivityFn) => {
  const limit = getLimitFromRequest(req);
  const offset = getOffsetFromRequest(req);
  const account = req.params.id;

  return innerHandleR(req, res, method({ account, limit, offset }))
}

export const feedHandleR = (req: express.Request, res: express.Response) => activityHandleR(req, res, getFeedData)
export const notificationsHandleR = (req: express.Request, res: express.Response) => activityHandleR(req, res, getNotificationsData)

const countHandleR = async  (req: express.Request, res: express.Response, method: GetCountFn) => {
  const account = req.params.id;

  return innerHandleR(req, res, method(account))
}

export const feedCountHandleR = (req: express.Request, res: express.Response) => countHandleR(req, res, getFeedCount)
export const notificationsCountHandleR = (req: express.Request, res: express.Response) => countHandleR(req, res, getNotificationsCount)