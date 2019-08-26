import { api } from '../server';
import { BlogId, PostId, CommentId, Post, Comment } from '../df-types/src/blogs';
import { Option } from '@polkadot/types'
import { EventData } from '@polkadot/types/type/Event';
const { Pool } = require('pg')

require("dotenv").config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

type EventAction = {
  eventName: string,
  data: EventData
}

type InsertData = BlogId | PostId | CommentId;

export const DispatchForDb = async (eventAction: EventAction) => {
  const { data } = eventAction;
  switch(eventAction.eventName){
    case 'AccountFollowed': {
      await insertAccountFollower(data);
      await insertActivityForAccount(eventAction);
      await fillActivityStreamWithAccountFollowers(data[1].toString())
      break;
    }
    case 'AccountUnfollowed': {
      await deleteAccountActivityWithActivityStream(data[0].toString(),data[1].toString());
      await deleteAccountFollower(data);
      break;
    }
    case 'BlogFollowed': {
      await insertBlogFollower(data);
      await insertActivity(eventAction);
      await fillActivityStreamWithBlogFollowers(data[1] as BlogId);
      await fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
    case 'BlogUnfollowed': {
      await deleteBlogActivityWithActivityStream(data[0].toString(),data[1] as BlogId)
      await deleteBlogFollower(data);
      break;
    }
    case 'PostCreated': {
      insertPostFollower(data);
      const postId = data[1] as PostId;
      console.log(postId);
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      const post = postOpt.unwrap();
      console.log(post);
      console.log(post.blog_id);
      const ids = [post.blog_id, postId ];
      await insertActivity(eventAction, ids);
      fillActivityStreamWithPostFollowers(postId);
      fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
    case 'SharePost': {
      const postId = data[1] as PostId;
      console.log(postId);
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      const post = postOpt.unwrap();
      console.log(post);
      console.log(post.blog_id);
      const ids = [post.blog_id, postId ];
      await insertActivity(eventAction, ids);
      fillActivityStreamWithPostFollowers(postId);
      fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
    case 'PostDeleted': {
      await deletePostActivityWithActivityStream(data[0].toString(),data[1] as PostId)
      await deletePostFollower(data);
      break;
    }
    case 'CommentCreated': {
      await insertCommentFollower(data);
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      const comment = commentOpt.unwrap();
      const postId = comment.post_id;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      const post = postOpt.unwrap();
      const ids = [post.blog_id, postId];
      if (comment.parent_id.isSome) {
        insertActivityComments(eventAction, ids,comment);
      }
      ids.push(commentId);
      await insertActivity(eventAction, ids);
      fillActivityStreamWithPostFollowers(postId);
      fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
    case 'ShareComment': {
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      const comment = commentOpt.unwrap();
      const postId = comment.post_id;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      const post = postOpt.unwrap();
      const ids = [post.blog_id, postId, commentId];
      await insertActivity(eventAction, ids);
      fillActivityStreamWithPostFollowers(postId);
      fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
    case 'CommentDeleted': {
      await deleteCommentActivityWithActivityStream(data[0].toString(),data[1] as CommentId);
      await deleteCommentFollower(data);
      break;
    }
    case 'PostReactionCreated': {
      const postId = data[1] as PostId;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      const post = postOpt.unwrap();
      const ids = [post.blog_id, postId ];
      console.log(post.blog_id.toHex());
      await insertActivity(eventAction, ids);
      fillActivityStreamWithPostFollowers(postId);
      fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
    case 'CommentReactionCreated': {
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      const comment = commentOpt.unwrap();
      const ids = [comment.post_id, null as PostId, commentId ];
      await insertActivity(eventAction, ids);
      fillActivityStreamWithCommentFollowers(commentId);
      fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
  }
}

//Utils
function encodeStructId (id: InsertData): string {
  if(!id) return null;
  return id.toHex().split('x')[1].replace(/(0+)/,'');
}

//Query
const insertAccountFollower = async (data: EventData) => {
  const query = 'INSERT INTO df.account_followers(follower_account, following_account) VALUES($1, $2) RETURNING *'
  const params = [data[0].toString(), data[1].toString()];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deleteAccountFollower = async (data: EventData) => {
  const query = 'DELETE from df.account_followers WHERE follower_account = $1 AND following_account = $2 RETURNING *'
  const params = [data[0].toString(), data[1].toString()];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertPostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = 'INSERT INTO df.post_followers(follower_account, following_post_id) VALUES($1, $2) RETURNING *'
  const params = [data[0].toString(), postId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deletePostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = 'DELETE from df.post_followers WHERE follower_account = $1 AND following_post_id = $2 RETURNING *'
  const params = [data[0].toString(), postId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as CommentId);
  const query = 'INSERT INTO df.comment_followers(follower_account, following_comment_id) VALUES($1, $2) RETURNING *'
  const params = [data[0].toString(), commentId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deleteCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as CommentId);
  const query = 'DELETE from df.comment_followers WHERE follower_account = $1 AND following_comment_id = $2 RETURNING *'
  const params = [data[0].toString(), commentId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertBlogFollower = async (data: EventData) => {
  const blogId = encodeStructId(data[1] as BlogId);
  const query = 'INSERT INTO df.blog_followers(follower_account, following_blog_id) VALUES($1, $2) RETURNING *'
  const params = [data[0].toString(), blogId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deleteBlogFollower = async (data: EventData) => {
  const blogId = encodeStructId(data[1] as BlogId);
  const query = 'DELETE from df.blog_followers WHERE follower_account = $1 AND following_blog_id = $2 RETURNING *'
  const params = [data[0].toString(), blogId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertActivityComments = async (eventAction: EventAction, ids: InsertData[], commentLast: Comment) => {
  let comment = commentLast;
  while(comment.parent_id.isSome)
  {
    const id = comment.parent_id.unwrap() as CommentId;
    const param = [...ids, id];
    insertActivity(eventAction,param);
    fillActivityStreamWithCommentFollowers(id);
    const commentOpt = await api.query.blogs.commentById(id) as Option<Comment>;
    comment = commentOpt.unwrap();
  }
};

const insertActivity = async (eventAction: EventAction, ids?: InsertData[]) => {
  let paramsIds: string[] = new Array(3).fill(null);
  console.log(paramsIds);
  if (!ids) eventAction.data.slice(1).forEach((id,index) => paramsIds[index] = encodeStructId(id as InsertData));
  else ids.forEach((id,index) => paramsIds[index] = encodeStructId(id));
  const { eventName, data } = eventAction;
  const accountId = data[0].toString();

  const query = 'INSERT INTO df.activities(account, events, blog_id, post_id, comment_id) VALUES($1, $2, $3, $4, $5) RETURNING *'
  const params = [accountId, eventName, ...paramsIds];
  console.log(params);
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};
const insertActivityForAccount = async (eventAction: EventAction) => {

  const { eventName, data } = eventAction;
  const accountId = data[0].toString();
  const objectId = data[1].toString();

  const query = 'INSERT INTO df.activities(account, events, object_id) VALUES($1, $2, $3) RETURNING *'
  const params = [accountId, eventName, objectId];
  try {
    const res = await pool.query(query, params);
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
  return accountId;
};

const fillActivityStreamWithAccountFollowers = async (accountId: string) => {
  const query = 'INSERT INTO df.notifications(account, activity_id) (SELECT df.account_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.account_followers ON df.activities.account = df.account_followers.following_account WHERE account = $1 and (df.account_followers.follower_account, df.activities.id) NOT IN (SELECT account,activity_id from df.notifications)) RETURNING *'
  const params = [accountId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deleteAccountActivityWithActivityStream = async (userId: string,accountId: string) => {
  const query = 'DELETE FROM df.notifications WHERE account = $1 and activity_id IN (SELECT df.activities.id FROM df.activities Left JOIN df.account_followers ON df.activities.account = df.account_followers.following_account WHERE account = $2) RETURNING *'
  const params = [userId, accountId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const fillActivityStreamWithBlogFollowers = async (blogId: BlogId) => {
  const query = 'INSERT INTO df.notifications(account, activity_id) (SELECT df.blog_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.blog_followers ON df.activities.blog_id = df.blog_followers.following_blog_id WHERE blog_id = $1 and (df.blog_followers.follower_account, df.activities.id) NOT IN (SELECT account,activity_id from df.notifications)) RETURNING *';
  const hexBlogId = encodeStructId(blogId);
  const params = [hexBlogId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deleteBlogActivityWithActivityStream = async (userId: string, blogId: BlogId) => {
  const query = 'DELETE FROM df.notifications WHERE account = $1 and activity_id IN (SELECT df.activities.id FROM df.activities Left JOIN df.blog_followers ON df.activities.account = df.blog_followers.following_blog_id WHERE blog_id = $2) RETURNING *'
  const hexBlogId = encodeStructId(blogId);
  const params = [userId, hexBlogId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const fillActivityStreamWithPostFollowers = async (postId: PostId) => {
  const query = 'INSERT INTO df.news_feed(account, activity_id) (SELECT df.post_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.post_followers ON df.activities.post_id = df.post_followers.following_post_id WHERE post_id = $1 and (df.post_followers.follower_account, df.activities.id) NOT IN (SELECT account,activity_id from df.news_feed)) RETURNING *'
  const hexPostId = encodeStructId(postId);
  const params = [hexPostId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deletePostActivityWithActivityStream = async (userId: string,postId: PostId) => {
  const query = 'DELETE FROM df.news_feed WHERE account = $1 and activity_id IN (SELECT df.activities.id FROM df.activities Left JOIN df.post_followers ON df.activities.account = df.post_followers.following_post_id WHERE post_id = $2) RETURNING *'
  const hexPostId = encodeStructId(postId);
  const params = [userId, hexPostId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const fillActivityStreamWithCommentFollowers = async (commentId: CommentId) => {
  const query = 'INSERT INTO df.notifications(account, activity_id) (SELECT df.comment_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.comment_followers ON df.activities.comment_id = df.comment_followers.following_comment_id WHERE comment_id = $1 and (df.comment_followers.follower_account, df.activities.id) NOT IN (SELECT account,activity_id from df.notifications))  RETURNING *'
  const hexCommentId = encodeStructId(commentId);
  const params = [hexCommentId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deleteCommentActivityWithActivityStream = async (userId: string,commentId: CommentId) => {
  const query = 'DELETE FROM df.notifications WHERE account = $1 and activity_id IN (SELECT df.activities.id FROM df.activities Left JOIN df.account_followers ON df.activities.account = df.account_followers.following_comment_id WHERE comment_id = $2) RETURNING *'
  const hexCommentId = encodeStructId(commentId);
  const params = [userId, hexCommentId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

