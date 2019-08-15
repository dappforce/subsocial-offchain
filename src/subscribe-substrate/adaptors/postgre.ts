import { EventData } from '@polkadot/types/type/Event';
import { api } from '../server';
import { BlogId, PostId, CommentId, Post, Comment } from './../../df-types/src/blogs';
import { Codec } from '@polkadot/types/types';
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

export const DispatchForDb = async (eventAction: EventAction) => {
  const { data } = eventAction;
  switch(eventAction.eventName){
    case 'AccountFollowed': {
      await insertAccountFollower(data);
      await insertActivityForAccount(eventAction);
      await fillActivityStreamWithAccountFollowers(data[0].toString())
      break;
    }
    case 'AccountUnfollowed': {
      // TODO deleteWithActivityStream()
      await deleteAccountFollower(data);
      break;
    }
    case 'BlogFollowed': {
      await insertBlogFollower(data);
      await insertActivity(eventAction);
      await fillActivityStreamWithBlogFollowers(encodeStructId(data[1]));
      break;
    }
    case 'BlogUnfollowed': {
      deleteBlogFollower(data);
      break;
    }
    case 'PostCreated': {
      await insertPostFollower(data);
      const postId = data[1];
      const post = await api.query.blogs.postById(postId) as Post;
      const ids = [post.blog_id, postId ];
      await insertActivity(eventAction, ids.map(id => encodeStructId(id)));
      await fillActivityStreamWithPostFollowers(encodeStructId(data[1]));
      break;
    }
    case 'PostDeleted': {
      deletePostFollower(data);
      break;
    }
    case 'CommentCreated': {
      await insertCommentFollower(data);
      const commentId = data[1];
      const comment = api.query.blogs.commentById(commentId) as unknown as Comment;
      const postId = comment.post_id;
      console.log(postId);
      const post = await api.query.blogs.postById(postId) as Post;
      const ids = [post.blog_id, postId, commentId ];
      console.log(post.blog_id.toHex());
      await insertActivity(eventAction, ids.map(id => encodeStructId(id)));
      await fillActivityStreamWithCommentFollowers(encodeStructId(data[1]));
      break;
    }
    case 'CommentDeleted': {
      deleteCommentFollower(data);
      break;
    }
    case 'PostReactionCreated': {
      const postId = data[1];
      const post = await api.query.blogs.postById(postId) as Post;
      const ids = [post.blog_id, postId ];
      console.log(post.blog_id.toHex());
      await insertActivity(eventAction, ids.map(id => encodeStructId(id)));
      await fillActivityStreamWithPostFollowers(encodeStructId(data[1]));
      break;
    }
    case 'CommentReactionCreated': {
      const commentId = data[1];
      const comment = api.query.blogs.commentById(commentId) as unknown as Comment;
      const postId = comment.post_id;
      const post = await api.query.blogs.postById(postId) as Post;
      const ids = [post.blog_id, postId, commentId ];
      console.log(post.blog_id.toHex());
      await insertActivity(eventAction, ids.map(id => encodeStructId(id)));
      await fillActivityStreamWithCommentFollowers(encodeStructId(data[1]));
      break;
    }
  }
}
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

const insertActivity = async (eventAction: EventAction, ids?: string[]) => {
  if (!ids) ids = eventAction.data.slice(1).map(id => encodeStructId(id));
  const { eventName, data } = eventAction;
  const accountId = data[0].toString();

  const query = 'INSERT INTO df.activities(account, events, blog_id, post_id, comment_id) VALUES($1, $2, $3, $4, $5) RETURNING *'
  const params = [accountId, eventName, ...ids];
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
    //await fillActivityStream(accountId);
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
  return accountId;
};
function encodeStructId (id: Codec): string {
  return id.toHex().split('x')[1].replace('0','');
}

const fillActivityStreamWithAccountFollowers = async (accountId: string) => {
  const query = 'INSERT INTO df.activity_stream(account, actitvity_id) (SELECT df.account_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.account_followers ON df.activities.account = df.account_followers.following_account WHERE df.activities.account = $1)'
  const params = [accountId];
  try {
    await pool.query(query, params);
    console.log('Insert');
  } catch (err) {
    console.log(err.stack);
  }
}

const fillActivityStreamWithBlogFollowers = async (blogId: string) => {
  const query = 'INSERT INTO df.activity_stream(account, actitvity_id) (SELECT df.blog_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.blog_followers ON df.activities.blog_id = df.account_followers.following_blog_id WHERE df.activities.blog_id = $1)'
  const params = [blogId];
  try {
    await pool.query(query, params);
    console.log('Insert');
  } catch (err) {
    console.log(err.stack);
  }
}
const fillActivityStreamWithPostFollowers = async (postId: string) => {
  const query = 'INSERT INTO df.activity_stream(account, actitvity_id) (SELECT df.post_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.post_followers ON df.activities.post_id = df.account_followers.following_post_id WHERE df.activities.post_id = $1)'
  const params = [postId];
  try {
    await pool.query(query, params);
    console.log('Insert');
  } catch (err) {
    console.log(err.stack);
  }
}
const fillActivityStreamWithCommentFollowers = async (commentId: string) => {
  const query = 'INSERT INTO df.activity_stream(account, actitvity_id) (SELECT df.comment_followers.follower_account, df.activities.id FROM df.activities Left JOIN df.comment_followers ON df.activities.comment_id = df.account_followers.following_comment_id WHERE df.activities.comment_id = $1)'
  const params = [commentId];
  try {
    await pool.query(query, params);
    console.log('Insert');
  } catch (err) {
    console.log(err.stack);
  }
}
