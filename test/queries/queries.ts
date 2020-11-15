import { SelectFromTableFn } from '../compare-data';
import { pg } from '../../src/connections/postgres';


export const selectFromActivities: SelectFromTableFn = async () => {
  const query = `
    SELECT account,
     block_number,
     event_index,
     event,
     following_id,
     space_id,
     post_id,
     comment_id,
     parent_comment_id,
     aggregated,
     agg_count
      FROM df.activities
      ORDER BY block_number, event_index
  `

  return (await pg.query(query)).rows
}

export const selectFromNotifications: SelectFromTableFn = async () => {
  const query = `
    SELECT account,
      block_number,
      event_index
      FROM df.notifications
        ORDER BY block_number, event_index
  `

  return (await pg.query(query)).rows
}
export const selectFromNewsFeed: SelectFromTableFn = async () => {
  const query = `
    SELECT account,
      block_number,
      event_index
      FROM df.news_feed
        ORDER BY block_number, event_index
  `

  return (await pg.query(query)).rows
}
export const selectFromAccountFollowers: SelectFromTableFn = async () => {
  const query = `
    SELECT follower_account,
    following_account
      FROM df.account_followers
  `

  return (await pg.query(query)).rows
}
export const selectFromPostFollowers: SelectFromTableFn = async () => {
  const query = `
    SELECT follower_account,
      following_post_id
      FROM df.post_followers
  `
  
  return (await pg.query(query)).rows
}
export const selectFromCommentFollowers: SelectFromTableFn = async () => {
  const query = `
    SELECT follower_account,
    following_comment_id
    FROM df.comment_followers
  `

  return (await pg.query(query)).rows
}

export const selectFromSpaceFollowers: SelectFromTableFn = async () => {
  const query = `
    SELECT follower_account,
    following_space_id
      FROM df.space_followers
  `

  return (await pg.query(query)).rows
}