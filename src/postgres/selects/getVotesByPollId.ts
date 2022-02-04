import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT DISTINCT account, vote, date FROM df.casted_votes
  WHERE poll_id = :pollId
`

type Result = {
  vote: string,
  account: string
}

export const getVotesByPoll = async (pollId: string): Promise<Result> => {
	try {
		const data = await runQuery(query, { pollId })
		return data.rows
	} catch (err) {
		log.error(`Failed to select votes by poll #${pollId}:`, err.stack)
		throw err
	}
}
