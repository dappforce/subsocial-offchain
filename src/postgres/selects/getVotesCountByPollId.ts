import { runQuery } from '../utils'
import { log } from '../postges-logger'

const query = `
  SELECT COUNT(*) as count FROM df.casted_votes
  WHERE poll_id = :pollId
`

export const getVotesCountByPollId = async (pollId: string): Promise<string> => {
  try {
    const data = await runQuery(query, { pollId })

    return data.rows?.pop().count
  } catch (err) {
    log.error(`Failed to select votes count by poll #${pollId}:`, err.stack)
    throw err
  }
}
