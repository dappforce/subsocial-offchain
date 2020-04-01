import { EventData } from '@polkadot/types/generic/Event';
import { pool } from '../adaptors/connect-postgre';
import { encodeStructId } from '../substrate/utils';
import * as events from 'events'
import { PostId, CommentId, BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertFollowersLog, insertFollowersLogError } from './postges-logger';
export const eventEmitter = new events.EventEmitter();
export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'eventUpdateNotificationsCounter'

export const insertAccountFollower = async (data: EventData) => {
  const query = `
      INSERT INTO df.account_followers(follower_account, following_account)
        VALUES($1, $2)
      RETURNING *`;
  const params = [ data[0].toString(), data[1].toString() ];
  try {
    await pool.query(query, params)
    insertFollowersLog('account')
  } catch (err) {
    insertFollowersLogError('account', err.stack)
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
    await pool.query(query, params)
    insertFollowersLog('post')
  } catch (err) {
    insertFollowersLogError('post', err.stack)
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
    await pool.query(query, params)
    insertFollowersLog('comment')
  } catch (err) {
    insertFollowersLogError('comment', err.stack)
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
    await pool.query(query, params)
    insertFollowersLog('blog')
  } catch (err) {
    insertFollowersLogError('blog', err.stack)
  }
};
