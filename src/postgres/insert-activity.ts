import { pool } from '../connections/connect-postgres';
import { encodeStructIds } from '../substrate/utils';
import { isEmptyArray } from '@subsocial/utils/array'
import { Comment } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../substrate/server';
import { updateCountOfUnreadNotifications, getAggregationCount } from './notifications';
import { insertActivityLog, insertActivityLogError, log, updateCountLog, emptyParamsLogError } from './postges-logger';
import { SubstrateId } from '@subsocial/types/substrate/interfaces/utils'
import { EventAction } from '../substrate/types';

export const insertNotificationForOwner = async (id: number, account: string) => {
  const params = [ account, id ]
  const query = `
      INSERT INTO df.notifications
        VALUES($1, $2) 
      RETURNING *`

  try {
    await pool.query(query, params)
    insertActivityLog('owner')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    insertActivityLogError('owner', err.stack)
  }
}

export const insertActivityComments = async (eventAction: EventAction, ids: SubstrateId[], commentLast: Comment) => {
  let comment = commentLast;
  const lastCommentAccount = commentLast.created.account.toString();
  while (comment.parent_id.isSome) {
    log.debug('parent_id is defined')
    const id = comment.parent_id.unwrap();
    const param = [ ...ids, id ];
    const parentComment = await substrate.findComment(id); // TODO test if working

    if (parentComment) { // TODO maybe use isEmpty from lodash
      comment = parentComment;
    }

    const account = comment.created.account.toString();
    const activityId = await insertActivityForComment(eventAction, param, account);

    if (account === lastCommentAccount) return;
    await insertNotificationForOwner(activityId, account);
  }
};

export const insertActivityForComment = async (eventAction: EventAction, ids: SubstrateId[], creator: string): Promise<number> => {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment')
    return -1
  }

  const [ postId ] = paramsIds;
  const { eventName, data, blockHeight } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
      INSERT INTO df.activities(account, event, post_id, comment_id, parent_comment_id, block_height, agg_count,aggregated)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`
  const count = await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId });
  const params = [ accountId, eventName, ...paramsIds, blockHeight, count, aggregated ];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;

    insertActivityLog('comment')

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
    log.debug('Params of update query:', [ ...paramsIdsUpd ]);
    log.debug(`parentId query: ${parentEq}, value: ${parentId}`);
    const paramsUpdate = [ activityId, eventName, ...paramsIdsUpd ];
    const resUpdate = await pool.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)
    return activityId;
  } catch (err) {
    insertActivityLogError('comment', err.stack);
    return -1;
  }
};

export const insertActivityForAccount = async (eventAction: EventAction, count: number): Promise<number> => {

  const { eventName, data, blockHeight } = eventAction;
  const accountId = data[0].toString();
  const objectId = data[1].toString();

  const query = `
      INSERT INTO df.activities(account, event, following_id, block_height, agg_count)
        VALUES($1, $2, $3, $4, $5)
      RETURNING *`
  const params = [ accountId, eventName, objectId, blockHeight, count ];
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
    updateCountLog(resUpdate.rowCount)
    insertActivityLog('account')
    return activityId;
  } catch (err) {
    insertActivityLogError('account', err.stack);
    return -1;
  }
};

export const insertActivityForBlog = async (eventAction: EventAction, count: number, creator?: string): Promise<number> => {

  const { eventName, data, blockHeight } = eventAction;
  const accountId = data[0].toString();
  const blogId = data[1].toString();
  const aggregated = accountId !== creator;
  const query = `
      INSERT INTO df.activities(account, event, blog_id, block_height, agg_count, aggregated)
        VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`
  const params = [ accountId, eventName, blogId, blockHeight, count, aggregated ];
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
    updateCountLog(resUpdate.rowCount)
    insertActivityLog('blog')
    return activityId;
  } catch (err) {
    insertActivityLogError('blog', err.stack);
    return -1;
  }
};

export const insertActivityForPost = async (eventAction: EventAction, ids: SubstrateId[], count?: number): Promise<number> => {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post')
    return -1
  }

  const [ , postId ] = paramsIds;
  const { eventName, data, blockHeight } = eventAction;
  const accountId = data[0].toString();
  const query = `
      INSERT INTO df.activities(account, event, blog_id, post_id, block_height, agg_count)
        VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`
  const newCount = eventName === 'PostShared'
    ? await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId })
    : count;

  const params = [ accountId, eventName, ...paramsIds, blockHeight, newCount ];
  try {
    const res = await pool.query(query, params)
    insertActivityLog('post')
    return res.rows[0].id;
  } catch (err) {
    insertActivityLogError('post', err.stack);
    return -1;
  }
};

export const insertActivityForPostReaction = async (eventAction: EventAction, count: number, ids: SubstrateId[], creator: string): Promise<number> => {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post reaction')
    return -1
  }

  const { eventName, data, blockHeight } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
      INSERT INTO df.activities(account, event, post_id, block_height, agg_count,aggregated)
        VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`
  const params = [ accountId, eventName, ...paramsIds, blockHeight, count, aggregated ];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    insertActivityLog('post reaction')
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
    updateCountLog(resUpdate.rowCount)

    return activityId;
  } catch (err) {
    insertActivityLogError('post reaction', err.stack);
    return -1;
  }
};

export const insertActivityForCommentReaction = async (eventAction: EventAction, count: number, ids: SubstrateId[], creator: string): Promise<number> => {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment reaction')
    return -1
  }

  const { eventName, data, blockHeight } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
      INSERT INTO df.activities(account, event, post_id, comment_id, block_height, agg_count,aggregated)
        VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`
  const params = [ accountId, eventName, ...paramsIds, blockHeight, count, aggregated ];
  try {
    const res = await pool.query(query, params)
    const activityId = res.rows[0].id;
    insertActivityLog('comment reaction')
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
    updateCountLog(resUpdate.rowCount)

    return activityId;
  } catch (err) {
    insertActivityLogError('comment reaction', err.stack);
    return -1;
  }
};
