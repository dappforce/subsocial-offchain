export const fillAccountFollowerQuery = (table: string) => {
  return `
    INSERT INTO df.${table} (account, block_number, event_index)
    (SELECT df.account_followers.follower_account, df.activities.block_number, df.activities.event_index
    FROM df.activities
    LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
    WHERE df.account_followers.follower_account <> :account
      AND block_number = :blockNumber
      AND event_index = :eventIndex
      AND (df.account_followers.follower_account, df.activities.block_number, df.activities.event_index)
      NOT IN (SELECT account, block_number, event_index from df.${table}))
    RETURNING *`
}

export const fillTableWith = (table: string, object: string) => {
  let parent_comment_id_clause = "";
  if (object == "post") parent_comment_id_clause = "AND parent_comment_id IS NULL"

  return `
    INSERT INTO df.${table} (account, block_number, event_index)
    (SELECT df.${object}_followers.follower_account, df.activities.block_number, df.activities.event_index
    FROM df.activities
    LEFT JOIN df.${object}_followers ON df.activities.${object}_id = df.${object}_followers.following_${object}_id
    WHERE ${object}_id = :${object}Id
      AND df.${object}_followers.follower_account <> :account
      AND block_number = :blockNumber
      AND event_index = :eventIndex
      AND aggregated = true
      ${parent_comment_id_clause}
      AND (df.${object}_followers.follower_account, df.activities.block_number, df.activities.event_index)
        NOT IN (SELECT account, block_number, event_index from df.${table}))
    RETURNING *;`
}