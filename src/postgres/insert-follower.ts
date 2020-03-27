import { EventData } from '@polkadot/types/generic/Event';
import { pool } from '../adaptors/connect-postgre';
import { encodeStructId } from '../substrate/utils';
import * as events from 'events'
import { PostId, CommentId, BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
export const eventEmitter = new events.EventEmitter();
export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'eventUpdateNotificationsCounter'

export const insertAccountFollower = async (data: EventData) => {
  const query = `
      INSERT INTO df.account_followers(follower_account, following_account)
        VALUES($1, $2)
      RETURNING *`;
  const params = [ data[0].toString(), data[1].toString() ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

export const insertPostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = `
      INSERT INTO df.post_followers(follower_account, following_post_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), postId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

export const insertCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as CommentId);
  const query = `
      INSERT INTO df.comment_followers(follower_account, following_comment_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), commentId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

export const insertBlogFollower = async (data: EventData) => {
  const blogId = encodeStructId(data[1] as BlogId);
  const query = `
      INSERT INTO df.blog_followers(follower_account, following_blog_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), blogId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};
