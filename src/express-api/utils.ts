import * as express from 'express'
import { nonEmptyStr, parseNumStr } from '@subsocial/utils'
import { expressApiLog } from '../connections/loggers'
import { Dayjs } from 'dayjs'
import { SessionCall } from '../postgres/types/sessionKey'
import { isValidSignature } from '../postgres/utils'

export const MAX_RESULTS_LIMIT = parseNumStr(process.env.MAX_RESULTS_LIMIT) || 20

export type HandlerFn = (req: express.Request, res: express.Response) => Promise<any>

export type Periodicity = 'Immediately' | 'Daily' | 'Weekly' | 'Never'

export type EmailSettings = {
	account: string,
	original_email: string,
	periodicity: Periodicity,
	send_feeds: boolean,
	send_notifs: boolean,
	last_block_bumber: number,
	last_event_index: number,
	confirmation_code: string,
	confirmed_on: Dayjs
}

type ErrorType = string | {
  status: string,
  data: string
}

export type OkOrError<T = null> = {
  ok: boolean,
  errors?: Record<string, ErrorType>
  data?: T
}

const getNumberFromRequest = (
  req: express.Request,
  value: 'limit' | 'offset',
  def: number
): number => {
  const reqParameter = req.query[value]
  return nonEmptyStr(reqParameter) ? parseNumStr(reqParameter) : def
}

export const resolvePromiseAndReturnJson = async (
  res: express.Response,
  promise: Promise<any>
) => {
  try {
    const data = await promise
    res.json(data)
  } catch (err) {
    expressApiLog.error(err)
    res.status(err?.statusCode || 400).send(err)
  }
}

export const getLimitFromRequest = (
  req: express.Request,
  maxLimit: number = MAX_RESULTS_LIMIT
): number => {
  const limit = getNumberFromRequest(req, 'limit', maxLimit)
  return limit < maxLimit ? limit : maxLimit
}

export const getOffsetFromRequest = (
  req: express.Request,
  defaultOffset?: number
): number => {
  return getNumberFromRequest(req, 'offset', defaultOffset)
}

// TODO: add check message.action
export const checkSignature = (req: express.Request, res: express.Response, next) => {
  const sessionCall = req.body.sessionCall as SessionCall<any>

  if (!sessionCall) {
    res.status(403).send('No "sessionCall" was found in request body')
  }

  const isValid = isValidSignature(sessionCall)
  if (!isValid) {
    res.status(403).send('Cannot verify the signature of the "sessionCall"')
  }

  next()
}

