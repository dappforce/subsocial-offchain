import { EventData } from '@polkadot/types/type/Event';
// import { api } from './../server';
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

export const DispatchForDb = (eventAction: EventAction) => {
  switch(eventAction.eventName){
    case 'AccountFollowed': {
      insertAccountFollower(eventAction.data);
      break;
    }
    case 'AccountUnfollowed': {
      deleteAccountFollower(eventAction.data);
      break;
    }
    case 'BlogFollowed': {
      insertBlogFollower(eventAction.data);
      break;
    }
    case 'BlogUnfollowed': {
      deleteBlogFollower(eventAction.data);
      break;
    }
    case 'PostCreated': {
      insertPostFollower(eventAction.data);
      break;
    }
    case 'PostDeleted': {
      deletePostFollower(eventAction.data);
      break;
    }
    case 'CommentCreated': {
      insertCommentFollower(eventAction.data);
      break;
    }
    case 'CommentDeleted': {
      deleteCommentFollower(eventAction.data);
      break;
    }
  }
  insertActivitiStream(eventAction);
}
const insertAccountFollower = async (data: EventData) => {
  const text = 'INSERT INTO df.account_followers(follower_account, following_account) VALUES($1, $2) RETURNING *'
  const values = [data[0].toString(), data[1].toString()];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deleteAccountFollower = async (data: EventData) => {
  const text = 'DELETE from df.account_followers WHERE follower_account = $1 AND following_account = $2 RETURNING *'
  const values = [data[0].toString(), data[1].toString()];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertPostFollower = async (data: EventData) => {
  const postId = data[1].toHex().split('x')[1];
  postId.replace('0','');
  console.log(postId);
  const text = 'INSERT INTO df.post_followers(follower_account, following_post_id) VALUES($1, $2) RETURNING *'
  const values = [data[0].toString(), postId];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deletePostFollower = async (data: EventData) => {
  const postId = data[1].toHex().split('x')[1];
  postId.replace('0','');
  const text = 'DELETE from df.post_followers WHERE follower_account = $1 AND following_post_id = $2 RETURNING *'
  const values = [data[0].toString(), postId];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertCommentFollower = async (data: EventData) => {
  const commentId = data[1].toHex().split('x')[1];
  commentId.replace('0','');
  console.log(commentId);
  const text = 'INSERT INTO df.comment_followers(follower_account, following_comment_id) VALUES($1, $2) RETURNING *'
  const values = [data[0].toString(), commentId];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deleteCommentFollower = async (data: EventData) => {
  const commentId = data[1].toHex().split('x')[1];
  commentId.replace('0','');
  const text = 'DELETE from df.comment_followers WHERE follower_account = $1 AND following_comment_id = $2 RETURNING *'
  const values = [data[0].toString(), commentId];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertBlogFollower = async (data: EventData) => {
  const blogId = data[1].toHex().split('x')[1];
  blogId.replace('0','');
  console.log(blogId);
  const text = 'INSERT INTO df.blog_followers(follower_account, following_blog_id) VALUES($1, $2) RETURNING *'
  const values = [data[0].toString(), blogId];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deleteBlogFollower = async (data: EventData) => {
  const blogId = data[1].toHex().split('x')[1];
  blogId.replace('0','');
  const text = 'DELETE from df.blog_followers WHERE follower_account = $1 AND following_blog_id = $2 RETURNING *'
  const values = [data[0].toString(), blogId];
  try {
    const res = await pool.query(text, values)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertActivitiStream = async (eventAction: EventAction) => {
  const { eventName, data } = eventAction;
  // const result = await api.query.blogs.blogById(data[1]);
  // console.log(result);
  let subjectId = '';
  if (eventName === 'AccountFollowed' || eventName === 'AccountUnfollowed')
  {
    subjectId = data[1].toString();
  } else {
    subjectId = data[1].toHex().split('x')[1];
  }

  const text = 'INSERT INTO df.activities_old(account, action, subject_id) VALUES($1, $2, $3) RETURNING *'
  const values = [data[0].toString(), eventName, subjectId];
  try {
    const res = await pool.query(text, values)
    await fillActivityStream();
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const fillActivityStream = async () => {
  const text = 'SELECT df.account_followers.follower_account, df.activities_old.id FROM df.activities_old RIGHT JOIN df.account_followers ON df.activities_old.account = df.account_followers.following_account'
  try {
    const res = await pool.query(text);
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}