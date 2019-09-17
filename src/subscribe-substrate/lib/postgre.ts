import { api } from '../server';
import { BlogId, PostId, CommentId, Post, Comment, Blog } from '../../df-types/src/blogs';
import { Option, AccountId, Vector } from '@polkadot/types'
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
      const count = (await api.query.blogs.accountFollowers(data[1]) as Vector<AccountId>).length - 1;
      const id = await insertActivityForAccount(eventAction, count);
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
      const activityId = await insertActivityForBlog(eventAction, 0);

      await fillNotificationsWithAccountFollowers(account, activityId);
      break;
    }
    case 'BlogFollowed': {
      await insertBlogFollower(data);
      const blogId = data[1] as BlogId;
      const blogOpt = await api.query.blogs.blogById(blogId) as Option<Blog>;
      if (blogOpt.isNone) return;

      const blog = blogOpt.unwrap();
      const count = blog.followers_count.toNumber();
      const account = blog.created.account.toString();
      const id = await insertActivityForBlog(eventAction, count, account);
      if (id === -1) return;

      const follower = data[0].toString();
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
      const activityId = await insertActivityForPost(eventAction, 0 , ids);
      if (activityId === -1) return;

      await fillActivityStreamWithBlogFollowers(post.blog_id, account, activityId);
      await fillNewsFeedWithAccountFollowers(account, activityId)
      break;
    }
    case 'PostShared': {
      const postId = data[1] as PostId;
      const follower = data[0].toString();
      console.log(postId);
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      console.log(post);
      console.log(post.blog_id);
      const ids = [post.blog_id, postId ];
      const activityId = await insertActivityForPost(eventAction, 0, ids);
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
      const postCreater = post.created.account.toString();
      const commentCreater = comment.created.account.toString();
      const ids = [postId, commentId];
      if (comment.parent_id.isSome) {
        console.log('PARENT ID');
        insertActivityComments(eventAction, ids,comment);
      } else {
        const count = post.comments_count.toNumber() - 1;

        const activityId = await insertActivityForComment(eventAction, count, ids, postCreater);
        if (activityId === -1) return;
  
        console.log('PARENT ID NULL');
        await fillActivityStreamWithPostFollowers(postId, commentCreater, activityId);
        await fillNotificationsWithAccountFollowers(commentCreater, activityId);
      }
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
      const count = post.comments_count.toNumber() - 1;
      const account = comment.created.account.toString();
      const activityId = await insertActivityForComment(eventAction, count,  ids, account);
      if (activityId === -1) return;

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
      const count = post.upvotes_count.toNumber() + post.downvotes_count.toNumber() - 1;
      const account = post.created.account.toString();
      const activityId = await insertActivityForPostReaction(eventAction, count, ids, account);
      if (activityId === -1) return;

      if (follower === account) return;

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
      const account = comment.created.account.toString();
      const count = comment.upvotes_count.toNumber() + comment.downvotes_count.toNumber() - 1;
      const activityId = await insertActivityForCommentReaction(eventAction, count, ids, account);
      if (activityId === -1) return;

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
    const count = comment.direct_replies_count.toNumber();
    const creater = comment.created.account.toString();
    const activityId = await insertActivityForComment(eventAction, count, param, creater); //TODO insert count
    const commentOpt = await api.query.blogs.commentById(id) as Option<Comment>;
    comment = commentOpt.unwrap();
    const account = comment.created.account.toString();
    if (account === lastCommentAccount) return;
    console.log('Parent id')
    await insertNotificationForOwner(activityId, account);
  }
};

const insertActivityForComment = async (eventAction: EventAction, count: number, ids: InsertData[], creater: string): Promise<number> => {
  let paramsIds: string[] = new Array(3).fill(null);

  ids.forEach((id,index) =>
    paramsIds[index] = encodeStructId(id)
  );

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId === creater ? false : true;
  const query = `
    INSERT INTO df.activities(account, event, post_id, comment_id, parent_comment_id, block_height, agg_count,aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`
  const params = [accountId, eventName, ...paramsIds, heightBlock, count, aggregated];
  console.log(params);
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    console.log(res.rows[0]);
    const [ postId, , parentId ] = paramsIds;
    let parentEq = '';
    const paramsIdsUpd = [ postId ];
    if (!parentId){
      parentEq += 'AND parent_comment_id IS NULL'
    } else {
      parentEq = 'AND parent_comment_id = $4';
      paramsIdsUpd.push(parentId);
    }
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND event = $2
            AND post_id = $3
            ${parentEq}
            AND aggregated = true
        RETURNING *`;
      console.log([...paramsIdsUpd]);
      console.log([paramsIds]);
      console.log(parentId);
      console.log(parentEq);
      const paramsUpdate = [activityId, eventName, ...paramsIdsUpd];
      const resUpdate = await pool.query(queryUpdate,paramsUpdate);
      console.log(resUpdate.rowCount);

    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

const insertActivityForAccount = async (eventAction: EventAction, count: number): Promise<number> => {

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const objectId = data[1].toString();

  const query = `
    INSERT INTO df.activities(account, event, following_id, block_height, agg_count)
      VALUES($1, $2, $3, $4, $5)
    RETURNING *`
  const params = [accountId, eventName, objectId, heightBlock, count];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND event = $2
            AND aggregated = true
            AND following_id = $3
        RETURNING *`;

      const paramsUpdate = [activityId, eventName, accountId];
      const resUpdate = await pool.query(queryUpdate,paramsUpdate);
      console.log(resUpdate.rowCount);
    console.log(res.rows[0])
    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

const insertActivityForBlog = async (eventAction: EventAction, count: number, creater?: string): Promise<number> => {

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const blogId = data[1].toString();

  const query = `
    INSERT INTO df.activities(account, event, blog_id, block_height, agg_count)
      VALUES($1, $2, $3, $4, $5)
    RETURNING *`
  const params = [accountId, eventName, blogId, heightBlock, count];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    const paramsUpdate = [activityId, eventName, accountId];
    let createrEq = '';
    if (creater) {
      createrEq = 'AND account <> $4';
      paramsUpdate.push(creater);
    }
    const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND event = $2
            AND aggregated = true
            AND following_id = $3
            ${createrEq}
        RETURNING *`;

      const resUpdate = await pool.query(queryUpdate,paramsUpdate);
      console.log(resUpdate.rowCount);
    console.log(res.rows[0])
    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

const insertActivityForPost = async (eventAction: EventAction, count: number, ids: InsertData[]): Promise<number> => {
  let paramsIds: string[] = new Array(2);

    ids.forEach((id,index) =>
      paramsIds[index] = encodeStructId(id)
    );

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const query = `
    INSERT INTO df.activities(account, event, blog_id, post_id, block_height, agg_count)
      VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`
  const params = [accountId, eventName, ...paramsIds, heightBlock, count];
  console.log(params);
  try {
    const res = await pool.query(query, params)
    return res.rows[0].id;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

const insertActivityForPostReaction = async (eventAction: EventAction, count: number, ids: InsertData[], creater: string): Promise<number> => {
  let paramsIds: string[] = new Array(2);

  ids.forEach((id,index) =>
    paramsIds[index] = encodeStructId(id)
  );

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const query = `
    INSERT INTO df.activities(account, event, blog_id, post_id, block_height, agg_count)
      VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`
  const params = [accountId, eventName, ...paramsIds, heightBlock, count];
  console.log(params);
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    console.log(res.rows[0]);
    const postId = paramsIds.pop();
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND account <> $2
            AND event = $3
            AND aggregated = true
            AND post_id = $4
        RETURNING *`;

      const paramsUpdate = [activityId, creater, eventName, postId];
      const resUpdate = await pool.query(queryUpdate,paramsUpdate);
      console.log(resUpdate.rowCount);

    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

const insertActivityForCommentReaction = async (eventAction: EventAction, count: number, ids: InsertData[], creater: string): Promise<number> => {
  let paramsIds: string[] = new Array(3);

  ids.forEach((id,index) =>
    paramsIds[index] = encodeStructId(id)
  );

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const query = `
    INSERT INTO df.activities(account, event, post_id, comment_id, parent_comment_id, block_height, agg_count)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`
  const params = [accountId, eventName, ...paramsIds, heightBlock, count];
  console.log(params);
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    paramsIds.pop();
    console.log(res.rows[0]);
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND account <> $2
            AND event = $3
            AND aggregated = true
            AND post_id = $4
            AND comment_id = $5
        RETURNING *`;

      const paramsUpdate = [activityId, creater, eventName, ...paramsIds];
      const resUpdate = await pool.query(queryUpdate,paramsUpdate);
      console.log(resUpdate.rowCount);
      
    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

const fillNewsFeedWithAccountFollowers = async (account: string, activityId: number) => {
  const query = `
    INSERT INTO df.news_feed (account, activity_id)
      (SELECT df.account_followers.follower_account, df.activities.id
      FROM df.activities
      LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
      WHERE df.account_followers.follower_account <> $1
        AND id = $2
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
      WHERE df.account_followers.follower_account <> $1
        AND id = $2
        AND aggregated = true
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
      WHERE blog_id = $1 AND df.blog_followers.follower_account <> $2
        AND id = $3
        AND aggregated = true
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
      WHERE post_id = $1 AND id = $3 AND aggregated = true AND parent_comment_id IS NULL
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
