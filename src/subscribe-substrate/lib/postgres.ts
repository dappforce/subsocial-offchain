import { api } from '../server';
import { BlogId, PostId, CommentId, Comment } from '../../df-types/src/blogs';
import { Option } from '@polkadot/types'
import { EventData } from '@polkadot/types/type/Event';
import { pool } from '../../adaptors/connectPostgre';
import { encodeStructId, InsertData } from './utils';
import { AggCountProps, EventAction, EVENT_UPDATE_NOTIFICATIONS_COUNTER, eventEmitter } from '../../adaptors/events'

const getAggregationCount = async (props: AggCountProps) => {
  const { eventName, post_id, account } = props;
  const params = [ account, eventName, post_id ];

  const query = `
  SELECT count(distinct account)
    FROM df.activities
    WHERE account <> $1
      AND event = $2
      AND post_id = $3`;
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0].count)
    return res.rows[0].count as number;
  } catch (err) {
    console.log(err.stack)
    return 0;
  }
}

export const insertNotificationForOwner = async (id: number, account: string) => {
  const query = `
    INSERT INTO df.notifications
      VALUES($1, $2) 
    RETURNING *`;
  const params = [ account, id ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack)
  }
}

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

export const deleteAccountFollower = async (data: EventData) => {
  const query = `
    DELETE from df.account_followers
    WHERE follower_account = $1
      AND following_account = $2
    RETURNING *`
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

export const deletePostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = `
    DELETE from df.post_followers
    WHERE follower_account = $1
      AND following_post_id = $2
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

export const deleteCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as CommentId);
  const query = `
    DELETE from df.comment_followers
    WHERE follower_account = $1
      AND following_comment_id = $2
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

export const deleteBlogFollower = async (data: EventData) => {
  const blogId = encodeStructId(data[1] as BlogId);
  const query = `
    DELETE from df.blog_followers
    WHERE follower_account = $1
      AND following_blog_id = $2
    RETURNING *`
  const params = [ data[0].toString(), blogId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
  } catch (err) {
    console.log(err.stack)
  }
};

export const insertActivityComments = async (eventAction: EventAction, ids: InsertData[], commentLast: Comment) => {
  let comment = commentLast;
  const lastCommentAccount = commentLast.created.account.toString();
  while (comment.parent_id.isSome) {
    const id = comment.parent_id.unwrap() as CommentId;
    const param = [ ...ids, id ];
    const commentOpt = await api.query.blogs.commentById(id) as Option<Comment>;

    comment = commentOpt.unwrap();

    const account = comment.created.account.toString();
    const activityId = await insertActivityForComment(eventAction, param, account);

    if (account === lastCommentAccount) return;
    console.log('Parent id')
    await insertNotificationForOwner(activityId, account);
  }
};

export const insertActivityForComment = async (eventAction: EventAction, ids: InsertData[], creator: string): Promise<number> => {
  const paramsIds: string[] = new Array(3).fill(null);

  ids.forEach((id, index) =>
    paramsIds[index] = encodeStructId(id)
  );

  const [ postId ] = paramsIds;
  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(account, event, post_id, comment_id, parent_comment_id, block_height, agg_count,aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`
  const count = await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId });
  const params = [ accountId, eventName, ...paramsIds, heightBlock, count, aggregated ];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    console.log(res.rows[0]);
    const [ postId, , parentId ] = paramsIds;
    let parentEq = '';
    const paramsIdsUpd = [ postId ];
    if (!parentId) {
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
    console.log([ ...paramsIdsUpd ]);
    console.log([ paramsIds ]);
    console.log(parentId);
    console.log(parentEq);
    const paramsUpdate = [ activityId, eventName, ...paramsIdsUpd ];
    const resUpdate = await pool.query(queryUpdate, paramsUpdate);
    console.log(resUpdate.rowCount);

    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

export const insertActivityForAccount = async (eventAction: EventAction, count: number): Promise<number> => {

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const objectId = data[1].toString();

  const query = `
    INSERT INTO df.activities(account, event, following_id, block_height, agg_count)
      VALUES($1, $2, $3, $4, $5)
    RETURNING *`
  const params = [ accountId, eventName, objectId, heightBlock, count ];
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

    const paramsUpdate = [ activityId, eventName, accountId ];
    const resUpdate = await pool.query(queryUpdate, paramsUpdate);
    console.log(resUpdate.rowCount);
    console.log(res.rows[0])
    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

export const insertActivityForBlog = async (eventAction: EventAction, count: number, creator?: string): Promise<number> => {

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const blogId = data[1].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(account, event, blog_id, block_height, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`
  const params = [ accountId, eventName, blogId, heightBlock, count, aggregated ];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    const paramsUpdate = [ activityId, eventName, blogId ];
    const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND event = $2
            AND aggregated = true
            AND blog_id = $3
        RETURNING *`;

    const resUpdate = await pool.query(queryUpdate, paramsUpdate);
    console.log(resUpdate.rowCount);
    console.log(res.rows[0])
    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

export const insertActivityForPost = async (eventAction: EventAction, ids: InsertData[], count?: number): Promise<number> => {
  const paramsIds: string[] = new Array(2);

  ids.forEach((id, index) =>
    paramsIds[index] = encodeStructId(id)
  );

  const [ , postId ] = paramsIds;
  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const query = `
    INSERT INTO df.activities(account, event, blog_id, post_id, block_height, agg_count)
      VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`
  const newCount = eventName === 'PostShared'
    ? await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId })
    : count;

  const params = [ accountId, eventName, ...paramsIds, heightBlock, newCount ];
  try {
    const res = await pool.query(query, params)
    return res.rows[0].id;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

export const insertActivityForPostReaction = async (eventAction: EventAction, count: number, ids: InsertData[], creator: string): Promise<number> => {
  const paramsIds: string[] = new Array(1);

  ids.forEach((id, index) =>
    paramsIds[index] = encodeStructId(id)
  );

  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(account, event, post_id, block_height, agg_count,aggregated)
      VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`
  const params = [ accountId, eventName, ...paramsIds, heightBlock, count, aggregated ];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    console.log(res.rows[0]);
    const postId = paramsIds.pop();
    const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND event = $2
            AND aggregated = true
            AND post_id = $3
        RETURNING *`;

    const paramsUpdate = [ activityId, eventName, postId ];
    const resUpdate = await pool.query(queryUpdate, paramsUpdate);
    console.log(resUpdate.rowCount);

    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

export const insertActivityForCommentReaction = async (eventAction: EventAction, count: number, ids: InsertData[], creator: string): Promise<number> => {
  const paramsIds: string[] = new Array(2);

  ids.forEach((id, index) =>
    paramsIds[index] = encodeStructId(id)
  );
  const { eventName, data, heightBlock } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(account, event, post_id, comment_id, block_height, agg_count,aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`
  const params = [ accountId, eventName, ...paramsIds, heightBlock, count, aggregated ];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    console.log(res.rows[0]);
    const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE id <> $1
            AND event = $2
            AND aggregated = true
            AND post_id = $3
            AND comment_id = $4
        RETURNING *`;

    const paramsUpdate = [ activityId, eventName, ...paramsIds ];
    const resUpdate = await pool.query(queryUpdate, paramsUpdate);
    console.log(resUpdate.rowCount);

    return activityId;
  } catch (err) {
    console.log(err.stack);
    return -1;
  }
};

export const fillNewsFeedWithAccountFollowers = async (account: string, activityId: number) => {
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
  const params = [ account, activityId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

export const fillNotificationsWithAccountFollowers = async (account: string, activityId: number) => {
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
  const params = [ account, activityId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}

export const deleteAccountActivityWithActivityStream = async (userId: string, accountId: string) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1
      AND activity_id IN
        (SELECT df.activities.id FROM df.activities
        LEFT JOIN df.account_followers
        ON df.activities.account = df.account_followers.following_account
        WHERE account = $2)
    RETURNING *`
  const params = [ userId, accountId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

export const fillActivityStreamWithBlogFollowers = async (blogId: BlogId, account: string, activityId: number) => {
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
  const params = [ hexBlogId, account, activityId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}

export const deleteBlogActivityWithActivityStream = async (userId: string, blogId: BlogId) => {
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
  const params = [ userId, hexBlogId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

export const fillActivityStreamWithPostFollowers = async (postId: PostId, account: string, activityId: number) => {
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
  const params = [ hexPostId, account, activityId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}

export const deletePostActivityWithActivityStream = async (userId: string, postId: PostId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1 AND activity_id IN
      (SELECT df.activities.id
      FROM df.activities
      LEFT JOIN df.post_followers ON df.activities.account = df.post_followers.following_post_id
      WHERE post_id = $2)
    RETURNING *`
  const hexPostId = encodeStructId(postId);
  const params = [ userId, hexPostId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

export const fillActivityStreamWithCommentFollowers = async (commentId: CommentId, account: string, activityId: number) => {
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
  const params = [ hexCommentId, account, activityId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}

export const deleteCommentActivityWithActivityStream = async (userId: string, commentId: CommentId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1
      AND activity_id IN
        (SELECT df.activities.id
        FROM df.activities
        LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_comment_id WHERE comment_id = $2)
    RETURNING *`
  const hexCommentId = encodeStructId(commentId);
  const params = [ userId, hexCommentId ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
  }
}

export const updateUnreadNotifications = async (account: string) => {
  const query = `
    INSERT INTO df.notifications_counter 
      (account, last_read_activity_id, unread_count)
    VALUES ($1, 0, 1)
    ON CONFLICT (account) DO UPDATE
    SET unread_count = (
      SELECT DISTINCT COUNT(*)
      FROM df.activities
      WHERE aggregated = true AND id IN ( 
        SELECT activity_id
        FROM df.notifications
        WHERE account = $1 AND activity_id > (
          SELECT last_read_activity_id
          FROM df.notifications_counter
          WHERE account = $1
        )
      )
    )
  `

  const params = [ account ]
  try {
    const res = await pool.query(query, params)
    console.log('Done in updateUnreadNotifications:', res.rows)
    const currentUnreadCount = await getUnreadNotifications(account) || 0
    eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, currentUnreadCount);
  } catch (err) {
    console.log('Error in updateUnreadNotifications:', err.stack);
  }
}

export const getUnreadNotifications = async (account: string) => {
  const query = `
    SELECT unread_count FROM df.notifications_counter
    WHERE account = $1;
  `
  try {
    const res = await pool.query(query, [ account ])
    console.log(res.rows[0].unread_count)
    return res.rows[0].unread_count as number;
  } catch (err) {
    console.log(err.stack);
    return 0
  }
}
