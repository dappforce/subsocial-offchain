import { runQuery } from '../utils'
import { log } from '../postges-logger'

const query = `
  SELECT sum(amount) as amount FROM df.casted_votes
  WHERE poll_id = :pollId AND vote = :vote
`

export const getVotesAmountByPollIdAndVote = async (pollId: string, vote: string): Promise<string> => {
  try {
    const data = await runQuery(query, { pollId, vote })
    return data.rows?.pop().amount || '0'
  } catch (err) {
    log.error(`Failed to select votes amount by poll #${pollId}:`, err.stack)
    throw err
  }
}