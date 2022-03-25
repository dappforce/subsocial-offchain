import { getVoteByAccountAndPoll } from "../../../postgres/selects/getVoteByAccountAndPoll"
import { getVotesByPoll } from "../../../postgres/selects/getVotesByPollId"
import { UpsertVote } from "../../../models"
import { upsertVote } from "../../../postgres/inserts/insertVote"
import { HandlerFn, parseParamsWithAccount, resolvePromiseAndReturnJson } from "../../utils"
import { getVotesDataByPollIdAndVote } from '../../../postgres/selects/getVotesDataByPollIdAndVotes'
import { isAccountEligibleForVote } from './utils'

export const getVoteByAccountAndPollHandler: HandlerFn = (req, res) => {
  const { account, pollId } = parseParamsWithAccount(req.params)
  return resolvePromiseAndReturnJson(res, getVoteByAccountAndPoll({ account, pollId }))
}

export const getVoteByPollHandler: HandlerFn = (req, res) => {
  const { pollId } = req.params
  return resolvePromiseAndReturnJson(res, getVotesByPoll(pollId))
}

export const getVotesDataByPollIdAndVoteHandler: HandlerFn = (req, res) => {
  const { params, query } = req
  return resolvePromiseAndReturnJson(res, getVotesDataByPollIdAndVote(params.pollId, query.votes as string[]))
}

export const isAccountEligibleForVoteHandler: HandlerFn = (req, res) => {
  const { account } = parseParamsWithAccount(req.params)
  res.json(isAccountEligibleForVote(account))
}

export const upsertVoteHandler: HandlerFn = (req, res) => {
  const params = parseParamsWithAccount(req.body) as UpsertVote
  return resolvePromiseAndReturnJson(res, upsertVote(params))
}