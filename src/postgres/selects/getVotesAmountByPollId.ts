import { log } from '../postges-logger'
import { runQuery } from '../utils'

const query = `
  SELECT sum(amount) as amount FROM df.casted_votes
  WHERE poll_id = :pollId
`

export const getVotesAmountByPollId = async (pollId: string): Promise<string> => {
  try {
    const data = await runQuery(query, { pollId })
    return data.rows?.pop().amount
  } catch (err) {
    log.error(`Failed to select votes amount by poll #${pollId}:`, err.stack)
    throw err
  }
}