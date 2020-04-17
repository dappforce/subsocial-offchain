import { EventData } from '@polkadot/types/generic/Event';
import { pool } from '../connections/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, CommentId, BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteFollowersLog, deleteFollowersLogError } from './postges-logger';

export const deletePostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = `
      DELETE from df.post_followers
      WHERE follower_account = $1
        AND following_post_id = $2
      RETURNING *`
  const params = [ data[0].toString(), postId ];
  try {
    await pool.query(query, params)
    deleteFollowersLog('post')
  } catch (err) {
    deleteFollowersLogError('post', err.stack)
  }
};

export const deleteCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as CommentId);
  const query = `
      DELETE from df.comment_followers
      WHERE follower_account = $1
        AND following_comment_id = $2
      RETURNING *`
  const params = [ data[0].toString(), commentId ];
  try {
    await pool.query(query, params)
    deleteFollowersLog('comment')
  } catch (err) {
    deleteFollowersLogError('comment', err.stack)

  }
};

export const deleteBlogFollower = async (data: EventData) => {
  const blogId = encodeStructId(data[1] as BlogId);
  const query = `
      DELETE from df.blog_followers
      WHERE follower_account = $1
        AND following_blog_id = $2
      RETURNING *`
  const params = [ data[0].toString(), blogId ];
  try {
    await pool.query(query, params)
    deleteFollowersLog('blog')
  } catch (err) {
    deleteFollowersLogError('blog', err.stack)

  }
};

export const deleteAccountFollower = async (data: EventData) => {
  const query = `
      DELETE from df.account_followers
      WHERE follower_account = $1
        AND following_account = $2
      RETURNING *`
  const params = [ data[0].toString(), data[1].toString() ];
  try {
    await pool.query(query, params)
    deleteFollowersLog('account')
  } catch (err) {
    deleteFollowersLogError('account', err.stack)

  }
};
