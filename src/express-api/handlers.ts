import * as express from 'express'
import { nonEmptyStr, parseNumStr } from '@subsocial/utils';
import { GetActivitiesFn, GetCountFn, GetCountsFn } from './queries/types';
import * as pgQueries from './queries';

const MAX_RESULT_LIMIT = parseNumStr(process.env.PGLIMIT) || 20

type HandlerFn = (req: express.Request, res: express.Response) => Promise<void>

const getNumberFromRequest = (
  req: express.Request,
  value: 'limit' | 'offset',
  def: number
): number => {
  const reqLimit = req.query[value]
  return nonEmptyStr(reqLimit) ? parseNumStr(reqLimit) : def
}

const getLimitFromRequest = (req: express.Request): number => {
  const limit = getNumberFromRequest(req, 'limit', MAX_RESULT_LIMIT)
  return limit < MAX_RESULT_LIMIT ? limit : MAX_RESULT_LIMIT
}

const getOffsetFromRequest = (req: express.Request): number =>
  getNumberFromRequest(req, 'offset', 0)

const callMethodAndReturnJson = async (
  _req: express.Request,
  res: express.Response,
  method: Promise<any>
) => {
  try {
    const data = await method
    res.json(data)
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
}

const activityHandler = (
  req: express.Request,
  res: express.Response,
  method: GetActivitiesFn
) => {
  const offset = getOffsetFromRequest(req)
  const limit = getLimitFromRequest(req)
  const account = req.params.id
  return callMethodAndReturnJson(req, res, method({ account, offset, limit }))
}

const countHandler = async (
  req: express.Request,
  res: express.Response,
  method: GetCountFn | GetCountsFn
) => {
  const account = req.params.id
  return callMethodAndReturnJson(req, res, method(account))
}

export const feedHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getFeedData)

export const feedCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getFeedCount)

export const notificationsHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getNotificationsData)

export const notificationsCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getNotificationsCount)

export const activitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getActivitiesData)

export const activitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getActivitiesCount)

export const commentActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getCommentActivitiesData)

export const commentActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getCommentActivitiesCount)

export const followActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getFollowActivitiesData)

export const followActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getFollowActivitiesCount)

export const postActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getPostActivitiesData)

export const postActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getPostActivitiesCount)

export const reactionActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getReactionActivitiesData)

export const reactionActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getReactionActivitiesCount)

export const spaceActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getSpaceActivitiesData)

export const spaceActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getSpaceActivitiesCount)

export const activityCountsHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getActivityCounts)
