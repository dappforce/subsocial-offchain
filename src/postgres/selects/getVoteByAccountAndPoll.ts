import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT DISTINCT vote, date FROM df.casted_votes
  WHERE poll_id = :pollId AND account = :account
`

type Result = {
  vote: string,
}

type Params = {
	account: string,
	pollId: string
}

export const getVoteByAccountAndPoll = async (params: Params): Promise<Result[]> => {
	try {
		const data = await runQuery(query, params)
		return data.rows[0]
	} catch (err) {
		log.error(`Failed to select vote by account (${params.account}) in poll #${params.pollId}:`, err.stack)
		throw err
	}
}
