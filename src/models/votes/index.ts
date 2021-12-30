export type UpsertVote = {
  pollId: string,
  account: string,
  vote: string,
  signature: string
}