import { pg } from '../connections/connect-postgres';
import { encodeStructIds, encodeStructId } from '../substrate/utils';
import { isEmptyArray } from '@subsocial/utils/array'
import { Post, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../substrate/subscribe';
import { updateCountOfUnreadNotifications, getAggregationCount } from './notifications';
import { insertActivityLog, insertActivityLogError, log, updateCountLog, emptyParamsLogError } from './postges-logger';
import { SubstrateId } from '@subsocial/types/substrate/interfaces/utils'
import { SubstrateEvent } from '../substrate/types';
import { InsertActivityPromise } from './queries/types';
import BN from 'bn.js';

export const insertNotificationForOwner = async (eventIndex: number, activityAccount: string, blockNumber: BN, account: string) => {
  const params = [account, eventIndex, activityAccount, blockNumber]
  const query = `
    INSERT INTO df.notifications
      VALUES($1, $2, $3, $4) 
    RETURNING *`

  try {
    await pg.query(query, params)
    insertActivityLog('owner')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    insertActivityLogError('owner', err.stack)
    throw err
  }
}

export const insertActivityComments = async (eventAction: SubstrateEvent, ids: SubstrateId[], lastComment: Post) => {
  let comment = lastComment;
  const lastCommentAccount = lastComment.created.account.toString();

  // TODO find all replies and insert into DB with a single query:
  while (comment.extension.asComment.parent_id.isSome) {
    log.debug('parent_id is defined')
    const id = comment.extension.asComment.parent_id.unwrap();
    const param = [...ids, id];
    const parentComment = await substrate.findPost({ id });

    if (parentComment) {
      comment = parentComment;
    }

    const account = comment.created.account.toString();
    const {eventIndex, activityAccount, blockNumber} = await insertActivityForComment(eventAction, param, account);

    if (account === lastCommentAccount) return;
    await insertNotificationForOwner(eventIndex, activityAccount, blockNumber, account);
  }
};

export const insertActivityForComment = async (eventAction: SubstrateEvent, ids: SubstrateId[], creator: string): InsertActivityPromise => {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment')
    return {}
  }

  if (paramsIds.length !== 3) {
    paramsIds.push(null);
  }

  const [postId] = paramsIds;
  const { eventName, data, eventIndex, blockNumber } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(event_index, account, block_number, event, post_id, comment_id, parent_comment_id, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`
  const count = await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId });
  const params = [eventIndex, accountId, blockNumber, eventName, ...paramsIds, count, aggregated];
  try {
    await pg.query(query, params)

    insertActivityLog('comment')

    const [postId, , parentId] = paramsIds;
    let parentEq = '';
    const paramsIdsUpd = [postId];
    if (!parentId) {
      parentEq += 'AND parent_comment_id IS NULL'
    } else {
      parentEq = 'AND parent_comment_id = $6';
      paramsIdsUpd.push(parentId);
    }
    const queryUpdate = `
      UPDATE df.activities
        SET aggregated = false
        WHERE event_index <> $1
          AND account <> $2
          AND block_number <> $3
          AND event = $4
          AND post_id = $5
          ${parentEq}
          AND aggregated = true
      RETURNING *`;
    log.debug('Params of update query:', [...paramsIdsUpd]);
    log.debug(`parentId query: ${parentEq}, value: ${parentId}`);
    const paramsUpdate = [eventIndex, accountId, blockNumber, eventName, ...paramsIdsUpd];
    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)

    return {eventIndex: eventIndex, activityAccount: accountId, blockNumber: blockNumber};
  } catch (err) {
    insertActivityLogError('comment', err.stack);
    throw err
  }
};

export const insertActivityForAccount = async (eventAction: SubstrateEvent, count: number): InsertActivityPromise => {

  const { eventName, data, eventIndex, blockNumber } = eventAction;
  const accountId = data[0].toString();
  const objectId = data[1].toString();

  const query = `
    INSERT INTO df.activities(event_index, account, block_number, event, following_id, agg_count)
      VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`
  const params = [eventIndex, accountId, blockNumber, eventName, objectId, count];
  try {
    await pg.query(query, params)
    const queryUpdate = `
      UPDATE df.activities
        SET aggregated = false
        WHERE event_index <> $1
          AND account <> $2
          AND block_number <> $3
          AND event = $4
          AND aggregated = true
          AND following_id = $2
      RETURNING *`;

    const paramsUpdate = [eventIndex, accountId, blockNumber, eventName];
    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)
    insertActivityLog('account')
    return {eventIndex: eventIndex, activityAccount: accountId, blockNumber: blockNumber};
  } catch (err) {
    insertActivityLogError('account', err.stack);
    throw err
  }
};

export const insertActivityForSpace = async (eventAction: SubstrateEvent, count: number, creator?: string): InsertActivityPromise => {

  const { eventName, data, eventIndex, blockNumber } = eventAction;
  const accountId = data[0].toString();
  const space_id = data[1] as SpaceId
  const spaceId = encodeStructId(space_id);
  const aggregated = accountId !== creator;

  console.log("Hi there")
  const query = `
    INSERT INTO df.activities(event_index, account, block_number, event, space_id, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`
  const params = [eventIndex, accountId, blockNumber, eventName, spaceId, count, aggregated];
  try {
    await pg.query(query, params)
    const paramsUpdate = [eventIndex, accountId, blockNumber, eventName, spaceId];
    const queryUpdate = `
      UPDATE df.activities
        SET aggregated = false
        WHERE event_index <> $1
          AND account <> $2
          AND block_number <> $3
          AND event = $4
          AND aggregated = true
          AND space_id = $5
      RETURNING *`;

    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)
    insertActivityLog('space')
    return {eventIndex: eventIndex, activityAccount: accountId, blockNumber: blockNumber};
  } catch (err) {
    insertActivityLogError('space', err.stack);
    throw err
  }
};

export const insertActivityForPost = async (eventAction: SubstrateEvent, ids: SubstrateId[], count?: number): InsertActivityPromise => {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post')
    return {}
  }

  const [, postId] = paramsIds;
  const { eventName, data, eventIndex, blockNumber } = eventAction;
  const accountId = data[0].toString();
  const query = `
    INSERT INTO df.activities(event_index, account, block_number, event, space_id, post_id, agg_count)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`
  const newCount = eventName === 'PostShared'
    ? await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId })
    : count;

  const params = [eventIndex, accountId, blockNumber, eventName, ...paramsIds, newCount];
  try {
    await pg.query(query, params)
    insertActivityLog('post')
    return {eventIndex: eventIndex, activityAccount: accountId, blockNumber: blockNumber};
  } catch (err) {
    insertActivityLogError('post', err.stack);
    throw err
  }
};

export const insertActivityForPostReaction = async (eventAction: SubstrateEvent, count: number, ids: SubstrateId[], creator: string): InsertActivityPromise => {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post reaction')
    return {}
  }

  const { eventName, data, eventIndex, blockNumber } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;

  const query = `
    INSERT INTO df.activities(event_index, account, block_number, event, post_id, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`
  const params = [eventIndex, accountId, blockNumber, eventName, ...paramsIds, count, aggregated];
  try {
    await pg.query(query, params)
    insertActivityLog('post reaction')
    const postId = paramsIds.pop();
    const queryUpdate = `
      UPDATE df.activities
        SET aggregated = false
        WHERE event_index <> $1
          AND account <> $2
          AND block_number <> $3
          AND event = $4
          AND aggregated = true
          AND post_id = $5
      RETURNING *`;

    const paramsUpdate = [eventIndex, accountId, blockNumber, eventName, postId];
    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)

    return {eventIndex: eventIndex, activityAccount: accountId, blockNumber: blockNumber};
  } catch (err) {
    insertActivityLogError('post reaction', err.stack);
    throw err
  }
};

export const insertActivityForCommentReaction = async (eventAction: SubstrateEvent, count: number, ids: SubstrateId[], creator: string): InsertActivityPromise => {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment reaction')
    return {}
  }

  const { eventName, data, eventIndex, blockNumber } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(event_index, account, block_number, event, post_id, comment_id, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`
  const params = [eventIndex, accountId, blockNumber, eventName, ...paramsIds, count, aggregated];
  try {
    await pg.query(query, params)
    insertActivityLog('comment reaction')
    const queryUpdate = `
      UPDATE df.activities
        SET aggregated = false
        WHERE event_index <> $1
          AND account <> $2
          AND block_number <> $3
          AND event = $4
          AND aggregated = true
          AND post_id = $5
          AND comment_id = $6
      RETURNING *`;

    const paramsUpdate = [eventIndex, accountId, blockNumber, eventName, ...paramsIds];
    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)

    return {eventIndex: eventIndex, activityAccount: accountId, blockNumber: blockNumber};
  } catch (err) {
    insertActivityLogError('comment reaction', err.stack);
    throw err
  }
}
