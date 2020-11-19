export const fillAccountFollowerQuery = (table: string) => {
  return `
    INSERT INTO df.${table} (account, block_number, event_index)
    (SELECT df.account_followers.follower_account, df.activities.block_number, df.activities.event_index
    FROM df.activities
    LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
    WHERE df.account_followers.follower_account <> $1
      AND block_number = $2
      AND event_index = $3
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
    WHERE ${object}_id = $1
      AND df.${object}_followers.follower_account <> $2
      AND block_number = $3
      AND event_index = $4
      AND aggregated = true
      ${parent_comment_id_clause}
      AND (df.${object}_followers.follower_account, df.activities.block_number, df.activities.event_index)
        NOT IN (SELECT account, block_number, event_index from df.${table}))
    RETURNING *;`
}