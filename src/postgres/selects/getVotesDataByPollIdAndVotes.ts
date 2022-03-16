import { getVotesCountByPollId } from './getVotesCountByPollId';
import { getVotesAmountByPollIdAndVote } from './getVotesAmountByPollIdAndVote';
import { getVotesAmountByPollId } from './getVotesAmountByPollId';

export const getVotesDataByPollIdAndVote = async (pollId: string, votes: string[]) => {
  const count = await getVotesCountByPollId(pollId)

  const amountByVote: Record<string, string> = {}

  const amountPromise = votes.map(async (vote) => {
    const amount = await getVotesAmountByPollIdAndVote(pollId, vote)

    amountByVote[vote] = amount
  })

  const totalAmount = await getVotesAmountByPollId(pollId)

  await Promise.all(amountPromise)

  return {
    count,
    amountByVote,
    totalAmount
  }
}
