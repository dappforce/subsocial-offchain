import { api } from '../server';
import { BlogId, PostId, CommentId, Post, Comment, Blog } from '../../df-types/src/blogs';
import { Option } from '@polkadot/types'
import { EventData } from '@polkadot/types/type/Event';
import { pool } from './../../adaptors/connectPostgre';
import BN from 'bn.js';

type EventAction = {
  eventName: string,
  data: EventData,
  heightBlock: BN
}

type InsertData = BlogId | PostId | CommentId;

export const DispatchForDb = async (eventAction: EventAction) => {
  const { data } = eventAction;
  switch(eventAction.eventName){
    case 'AccountFollowed': {
      await insertAccountFollower(data);
      const id = await insertActivityForAccount(eventAction);
      if (id === -1) return;

      const following = data[1].toString();
      // insertAggStreamForFollow(eventAction);
      await insertNotificationForOwner(id, following);
      break;
    }
    case 'AccountUnfollowed': {
      const follower = data[0].toString();
      const following = data[1].toString();
      await deleteAccountActivityWithActivityStream(follower, following);
      await deleteAccountFollower(data);
      break;
    }
    case 'BlogCreated': {
      const account = data[0].toString();
      const activityId = await insertActivity(eventAction);
      // insertAggStream(eventAction);
      await fillNotificationsWithAccountFollowers(account, activityId);
      break;
    }
    case 'BlogFollowed': {
      await insertBlogFollower(data);
      const id = await insertActivity(eventAction);
      if (id === -1) return;

      const blogId = data[1] as BlogId;
      const blogOpt = await api.query.blogs.blogById(blogId) as Option<Blog>;
      if (blogOpt.isNone) return;

      const blog = blogOpt.unwrap();
      const follower = data[0].toString();
      const account = blog.created.account.toString();
      if (follower === account) return;

      // insertAggStream(eventAction);
      insertNotificationForOwner(id, account);
      break;
    }
    case 'BlogUnfollowed': {
      const follower = data[0].toString();
      const following = data[1] as BlogId;
      await deleteBlogActivityWithActivityStream(follower, following)
      await deleteBlogFollower(data);
      break;
    }
    case 'PostCreated': {
      insertPostFollower(data);
      const postId = data[1] as PostId;
      const account = data[0].toString();
      console.log(postId);
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      console.log(post);
      console.log(post.blog_id);
      const ids = [post.blog_id, postId ];
      const activityId = await insertActivity(eventAction, ids);
      if (activityId === -1) return;

      await fillActivityStreamWithBlogFollowers(post.blog_id, account, activityId);
      await fillNewsFeedWithAccountFollowers(account, activityId)
      break;
    }
    case 'PostSBlogFollowedhared': {
      const postId = data[1] as PostId;
      const follower = data[0].toString();
      console.log(postId);
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      console.log(post);
      console.log(post.blog_id);
      const ids = [post.blog_id, postId ];
      const activityId = await insertActivity(eventAction, ids);
      if (activityId === -1) return;

      const account = post.created.account.toString();
      insertNotificationForOwner(activityId, account);
      fillNewsFeedWithAccountFollowers(follower, activityId);
      break;
    }
    case 'PostDeleted': {
      const follower = data[0].toString();
      const following = data[1] as PostId;
      await deletePostActivityWithActivityStream(follower, following);
      await deletePostFollower(data);
      break;
    }
    case 'CommentCreated': {
      await insertCommentFollower(data);
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      if (commentOpt.isNone) return;

      const comment = commentOpt.unwrap();
      const postId = comment.post_id;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      const ids = [post.blog_id, postId];
      if (comment.parent_id.isSome) {
        insertActivityComments(eventAction, ids,comment);
      }
      ids.push(commentId);
      const activityId = await insertActivity(eventAction, ids);
      if (activityId === -1) return;

      console.log('i in comment');
      // insertAggStream(eventAction, postId);
      const account = comment.created.account.toString();
      await fillActivityStreamWithPostFollowers(postId, account, activityId);
      await fillNotificationsWithAccountFollowers(account, activityId);
      break;
    }
    case 'CommentShared': {
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      if (commentOpt.isNone) return;

      const comment = commentOpt.unwrap();
      const postId = comment.post_id;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      const ids = [post.blog_id, postId, commentId];
      const activityId = await insertActivity(eventAction, ids);
      if (activityId === -1) return;

      // insertAggStream(eventAction, postId);
      const account = comment.created.account.toString();
      fillActivityStreamWithCommentFollowers(commentId, account, activityId);
      fillNotificationsWithAccountFollowers(account, activityId);
      break;
    }
    case 'CommentDeleted': {
      const follower = data[0].toString();
      const following = data[1] as CommentId;
      await deleteCommentActivityWithActivityStream(follower, following);
      await deleteCommentFollower(data);
      break;
    }
    case 'PostReactionCreated': {
      const follower = data[0].toString();
      const postId = data[1] as PostId;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      const ids = [post.blog_id, postId ];
      console.log(post.blog_id.toHex());
      const activityId = await insertActivity(eventAction, ids);
      if (activityId === -1) return;

      const account = post.created.account.toString();
      if (follower === account) return;

      // insertAggStream(eventAction, postId);
      insertNotificationForOwner(activityId, account);
      break;
    }
    case 'CommentReactionCreated': {
      const follower = data[0].toString();
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      if (commentOpt.isNone) return;

      const comment = commentOpt.unwrap();
      const ids = [comment.post_id, null, commentId ];
      const activityId = await insertActivity(eventAction, ids);
      if (activityId === -1) return;

      const account = comment.created.account.toString();
      if (follower === account) return;

      // insertAggStream(eventAction, commentId);
      insertNotificationForOwner(activityId, account);
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
const insertNotificationForOwner = async (id: number, account: string) => {
  const query = `
    INSERT INTO df.notifications
      VALUES($1, $2) 
    RETURNING *`;
  const params = [account, id];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
}

const insertAccountFollower = async (data: EventData) => {
  console.log(data);
  const query = `
    INSERT INTO df.account_followers(follower_account, following_account)
      VALUES($1, $2)
    RETURNING *`;
  const params = [data[0].toString(), data[1].toString()];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const deleteAccountFollower = async (data: EventData) => {
  const query = `
    DELETE from df.account_followers
    WHERE follower_account = $1
      AND following_account = $2
    RETURNING *`
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
  const query = `
    INSERT INTO df.post_followers(follower_account, following_post_id)
      VALUES($1, $2)
    RETURNING *`
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
  const query = `
    DELETE from df.post_followers
    WHERE follower_account = $1
      AND following_post_id = $2
    RETURNING *`
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
  const query = `
    INSERT INTO df.comment_followers(follower_account, following_comment_id)
      VALUES($1, $2)
    RETURNING *`
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
  const query = `
    DELETE from df.comment_followers
    WHERE follower_account = $1
      AND following_comment_id = $2
    RETURNING *`
  const params = [data[0].toString(), commentId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

const insertBlogFollower = async (data: EventData) => {
  console.log(data);
  const blogId = encodeStructId(data[1] as BlogId);
  const query = `
    INSERT INTO df.blog_followers(follower_account, following_blog_id)
      VALUES($1, $2)
    RETURNING *`
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
  const query = `
    DELETE from df.blog_followers
    WHERE follower_account = $1
      AND following_blog_id = $2
    RETURNING *`
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
  let lastCommentAccount = commentLast.created.account.toString();
  while(comment.parent_id.isSome)
  {
    const id = comment.parent_id.unwrap() as CommentId;
    const param = [...ids, id];
    const activityId = await insertActivity(eventAction,param);
    const account = comment.created.account.toString();
    const commentOpt = await api.query.blogs.commentById(id) as Option<Comment>;
    comment = commentOpt.unwrap();
    if (account === lastCommentAccount) return;

    await insertNotificationForOwner(activityId, account);
  }
};

const insertActivity = async (eventAction: EventAction, ids?: InsertData[]): Promise<number> => {
  let paramsIds: string[] = new Array(3).fill(null);
  console.log(paramsIds);
  if (!ids) {
    eventAction.data.slice(1).forEach((id,index) =>
      paramsIds[index] = encodeStructId(id as InsertData)
    );
  } else {
    ids.forEach((id,index) =>
      paramsIds[index] = encodeStructId(id)
    );
  }
  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();

  const query = `
    INSERT INTO df.activities(account, event, blog_id, post_id, comment_id, heightBlock)
      VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`
  const params = [accountId, eventName, ...paramsIds, heightBlock];
  console.log(params);
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    console.log(res.rows[0]);

    if (eventName !== 'PostCreated') {
      let eventEq = 'blog_id = $3 AND post_id = $4';

      if (eventName === 'CommentReactionCreated') {
        eventEq += ' AND comment_id = $5'
      } else {
        paramsIds.pop();
      }

      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1 AND event = $2 AND aggregated = true AND ${eventEq}
        RETURNING *`;

      const paramsUpdate = [activityId, eventName, ...paramsIds];
      const resUpdate = await pool.query(queryUpdate,paramsUpdate);
      console.log(resUpdate.rowCount);
    }

    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};
const insertActivityForAccount = async (eventAction: EventAction): Promise<number> => {

  const { eventName, data } = eventAction;
  const accountId = data[0].toString();
  const objectId = data[1].toString();

  const query = `
    INSERT INTO df.activities(account, event, following_id)
      VALUES($1, $2, $3)
    RETURNING *`
  const params = [accountId, eventName, objectId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
    return res.rows[0].id;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

// const insertAggStreamForFollow = async (eventAction: EventAction) => {
//   const { eventName, data } = eventAction;
//   const account = data[0].toString();
//   const following = data[1].toString();
//   const query = `
//     with updated as (
//       UPDATE df.agg_stream
//           SET account = $1,
//               subject_count = subject_count + 1
//     WHERE event = $2 AND following_id = $3
//     RETURNING *
//     )
//     INSERT INTO df.agg_stream (account, event, following_id, subject_count)
//     SELECT $1, $2, $3, 0
//     WHERE NOT EXISTS (SELECT * FROM df.agg_stream WHERE event = $2 AND following_id = $3)
//     RETURNING *;`
//     const params = [account, eventName, following];
//   try {
//     const res = await pool.query(query, params)
//     console.log(res.rows[0])
//   } catch (err) {
//     console.log(err.stack);
//   }
// };

// const insertAggStream = async (eventAction: EventAction, subjectId?: InsertData) => {
//   let subjectParam;
//   if (!subjectId) {
//     subjectParam = encodeStructId(eventAction.data[1] as InsertData);
//   } else {
//     subjectParam = encodeStructId(subjectId);
//   }
//   const { eventName, data } = eventAction;
//   const account = data[0].toString();

//   const query = `
//     with updated as (
//       UPDATE df.agg_stream
//           SET account = $1,
//               subject_count = subject_count + 1
//     WHERE event = $2 AND subject_id = $3
//     RETURNING *
//     )
//     INSERT INTO df.agg_stream (account, event, subject_id, subject_count)
//     SELECT $1, $2, $3, 0
//     WHERE NOT EXISTS (SELECT * FROM df.agg_stream WHERE event = $2 AND subject_id = $3)
//     RETURNING *;`
//     const params = [account, eventName, subjectParam];
//   try {
//     const res = await pool.query(query, params)
//     console.log(res.rows[0])
//   } catch (err) {
//     console.log(err.stack);
//   }
// };

const fillNewsFeedWithAccountFollowers = async (account: string, activityId: number) => {
  const query = `
    INSERT INTO df.news_feed (account, activity_id)
      (SELECT df.account_followers.follower_account, df.activities.id
      FROM df.activities
      LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
      WHERE df.account_followers.follower_account <> $1 AND id = $2
        AND (df.account_followers.follower_account, df.activities.id)
        NOT IN (SELECT account, activity_id from df.news_feed))
    RETURNING *`
  const params = [account, activityId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const fillNotificationsWithAccountFollowers = async (account: string, activityId: number) => {
  const query = `
    INSERT INTO df.notifications (account, activity_id)
      (SELECT df.account_followers.follower_account, df.activities.id
      FROM df.activities
      LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
      WHERE df.account_followers.follower_account <> $1 AND id = $2 AND aggregated = true
        AND (df.account_followers.follower_account, df.activities.id)
        NOT IN (SELECT account, activity_id from df.notifications))
    RETURNING *`
  const params = [account, activityId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deleteAccountActivityWithActivityStream = async (userId: string,accountId: string) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1
      AND activity_id IN
        (SELECT df.activities.id FROM df.activities
        LEFT JOIN df.account_followers
        ON df.activities.account = df.account_followers.following_account
        WHERE account = $2)
    RETURNING *`
  const params = [userId, accountId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const fillActivityStreamWithBlogFollowers = async (blogId: BlogId, account: string, activityId: number) => {
  const query = `
    INSERT INTO df.news_feed(account, activity_id)
      (SELECT df.blog_followers.follower_account, df.activities.id
      FROM df.activities
      LEFT JOIN df.blog_followers ON df.activities.blog_id = df.blog_followers.following_blog_id
      WHERE blog_id = $1 AND df.blog_followers.follower_account <> $2 AND id = $3 AND aggregated = true
        AND (df.blog_followers.follower_account, df.activities.id)
        NOT IN (SELECT account,activity_id from df.news_feed))
    RETURNING *`;
  const hexBlogId = encodeStructId(blogId);
  const params = [hexBlogId, account, activityId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deleteBlogActivityWithActivityStream = async (userId: string, blogId: BlogId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1
      AND activity_id IN
        (SELECT df.activities.id
        FROM df.activities
        LEFT JOIN df.blog_followers ON df.activities.account = df.blog_followers.following_blog_id
        WHERE blog_id = $2)
    RETURNING *`
  const hexBlogId = encodeStructId(blogId);
  const params = [userId, hexBlogId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const fillActivityStreamWithPostFollowers = async (postId: PostId, account: string, activityId: number) => {
  const query = `
    INSERT INTO df.notifications(account, activity_id)
      (SELECT df.post_followers.follower_account, df.activities.id
      FROM df.activities
      LEFT JOIN df.post_followers ON df.activities.post_id = df.post_followers.following_post_id
      WHERE post_id = $1 AND id = $3 AND aggregated = true
        AND df.post_followers.follower_account <> $2
        AND (df.post_followers.follower_account, df.activities.id)
        NOT IN (SELECT account,activity_id from df.notifications))
    RETURNING *`
  const hexPostId = encodeStructId(postId);
  const params = [hexPostId, account, activityId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deletePostActivityWithActivityStream = async (userId: string,postId: PostId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1 AND activity_id IN
      (SELECT df.activities.id
      FROM df.activities
      LEFT JOIN df.post_followers ON df.activities.account = df.post_followers.following_post_id
      WHERE post_id = $2)
    RETURNING *`
  const hexPostId = encodeStructId(postId);
  const params = [userId, hexPostId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const fillActivityStreamWithCommentFollowers = async (commentId: CommentId,account:string, activityId: number) => {
  const query = `
    INSERT INTO df.notifications(account, activity_id)
      (SELECT df.comment_followers.follower_account, df.activities.id
      FROM df.activities
      LEFT JOIN df.comment_followers ON df.activities.comment_id = df.comment_followers.following_comment_id WHERE comment_id = $1 AND id = $3 AND aggregated = true
        AND df.comment_followers.follower_account <> $2
        AND (df.comment_followers.follower_account, df.activities.id)
        NOT IN (SELECT account,activity_id from df.notifications))
    RETURNING *`
  const hexCommentId = encodeStructId(commentId);
  const params = [hexCommentId, account, activityId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

const deleteCommentActivityWithActivityStream = async (userId: string,commentId: CommentId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1
      AND activity_id IN
        (SELECT df.activities.id
        FROM df.activities
        LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_comment_id WHERE comment_id = $2)
    RETURNING *`
  const hexCommentId = encodeStructId(commentId);
  const params = [userId, hexCommentId];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

