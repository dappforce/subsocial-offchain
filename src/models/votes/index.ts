import { SignMessage } from '../common'

type UpsertVoteMessage = {
  pollId: string
  vote: string
}

export type UpsertVote = SignMessage<UpsertVoteMessage>
