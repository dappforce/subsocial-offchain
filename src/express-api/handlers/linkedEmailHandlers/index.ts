export const getLinkedEmailByAccount: HandlerFn = (req, res) => {
  const { account, pollId } = parseParamsWithAccount(req.params)
  return resolvePromiseAndReturnJson(res, getVoteByAccountAndPoll({ account, pollId }))
}

export const getVoteByPollHandler: HandlerFn = (req, res) => {
  const { pollId } = req.params
  return resolvePromiseAndReturnJson(res, getVotesByPoll(pollId))
}

export const upsertVoteHandler: HandlerFn = (req, res) => {
  const params = parseParamsWithAccount(req.body) as UpsertVote
  return resolvePromiseAndReturnJson(res, upsertVote(params))
}

