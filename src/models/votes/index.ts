import { SignedMessage } from '../common'

type UpsertVoteMessage = {
  pollId: string
  vote: string
}

export type UpsertVote = SignedMessage<UpsertVoteMessage>
