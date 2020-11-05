import { pg } from '../connections/postgres';
import { encodeStructIds, encodeStructId } from '../substrate/utils';
import { isEmptyArray } from '@subsocial/utils/array'
import { Post, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { getValidDate } from '../substrate/subscribe';
import { updateCountOfUnreadNotifications, getAggregationCount } from './notifications';
import { log, updateCountLog, emptyParamsLogError, tryPgQuery } from './postges-logger';
import { SubstrateId } from '@subsocial/types/substrate/interfaces/utils'
import { SubstrateEvent } from '../substrate/types';
import { substrate } from '../connections/subsocial';
import { InsertActivityPromise, ActivitiesParamsWithAccount } from './queries/types';

export const insertNotificationForOwner = async ({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const params = [account, blockNumber, eventIndex]
  const query = `
    INSERT INTO df.notifications
      VALUES($1, $2, $3) 
    RETURNING *`

  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      await updateCountOfUnreadNotifications(account)
    },
    {
      success: 'InsertNotificationForOwner function worked successfully',
      error: 'InsertNotificationForOwner function failed: '
    }
  )
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
    const insertResult = await insertActivityForComment(eventAction, param, account);

    if (account === lastCommentAccount) return;
    await insertNotificationForOwner({ ...insertResult, account });
  }
};

export const insertActivityForComment = async (eventAction: SubstrateEvent, ids: SubstrateId[], creator: string): InsertActivityPromise => {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment')
    return undefined
  }

  if (paramsIds.length !== 3) {
    paramsIds.push(null);
  }

  const [postId] = paramsIds;
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, post_id, comment_id, parent_comment_id, date, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`
  const date = await getValidDate(blockNumber)
  const count = await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId });
  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, count, aggregated];

  await tryPgQuery(
    async () => {
      await pg.query(query, params)

      const [postId, , parentId] = paramsIds;
      let parentEq = '';
      const paramsIdsUpd = [postId];
      if (!parentId) {
        parentEq += 'AND parent_comment_id IS NULL'
      } else {
        parentEq = 'AND parent_comment_id = $5';
        paramsIdsUpd.push(parentId);
      }
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE block_number <> $1
            AND event_index <> $2
            AND event = $3
            AND post_id = $4
            ${parentEq}
            AND aggregated = true
        RETURNING *`;
      log.debug('Params of update query:', [...paramsIdsUpd]);
      log.debug(`parentId query: ${parentEq}, value: ${parentId}`);
      const paramsUpdate = [blockNumber, eventIndex, eventName, ...paramsIdsUpd];
      const resUpdate = await pg.query(queryUpdate, paramsUpdate);
      updateCountLog(resUpdate.rowCount)
    },
    {
      success: 'InsertActivityForComment function worked successfully',
      error: 'InsertActivityForComment function failed: '
    }
  )
  return {blockNumber, eventIndex};
};

export const insertActivityForAccount = async (eventAction: SubstrateEvent, count: number): InsertActivityPromise => {

  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const objectId = data[1].toString();

  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, following_id, date, agg_count)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`
  const date = await getValidDate(blockNumber)

  const params = [blockNumber, eventIndex, accountId, eventName, objectId, date, count];

  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE block_number <> $1
            AND event_index <> $3
            AND event = $4
            AND aggregated = true
            AND following_id = $2
        RETURNING *`;

      const paramsUpdate = [blockNumber, accountId, eventIndex, eventName];
      const resUpdate = await pg.query(queryUpdate, paramsUpdate);
      updateCountLog(resUpdate.rowCount)
    },
    {
      success: 'InsertActivityForAccount function worked successfully',
      error: 'InsertActivityForAccount function failed: '
    }
  )
  return {blockNumber, eventIndex};
};

export const insertActivityForSpace = async (eventAction: SubstrateEvent, count: number, creator?: string): InsertActivityPromise => {

  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const space_id = data[1] as SpaceId
  const spaceId = encodeStructId(space_id);
  const aggregated = accountId !== creator;

  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, space_id, date, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`
  const date = await getValidDate(blockNumber)
  const params = [blockNumber, eventIndex, accountId, eventName, spaceId, date, count, aggregated];
  
  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      const paramsUpdate = [blockNumber, eventIndex, eventName, spaceId];
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE block_number <> $1
            AND event_index <> $2
            AND event = $3
            AND aggregated = true
            AND space_id = $4
        RETURNING *`;

      const resUpdate = await pg.query(queryUpdate, paramsUpdate);
      updateCountLog(resUpdate.rowCount)
    },
    {
      success: 'InsertActivityForSpace function worked successfully',
      error: 'InsertActivityForSpace function failed: '
    }
  )
  return {blockNumber, eventIndex};
};

export const insertActivityForPost = async (eventAction: SubstrateEvent, ids: SubstrateId[], count?: number): InsertActivityPromise => {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post')
    return undefined
  }

  const [, postId] = paramsIds;
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, space_id, post_id, date, agg_count)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`
  const date = await getValidDate(blockNumber)
  const newCount = eventName === 'PostShared'
    ? await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId })
    : count;

  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, newCount];
  
  await tryPgQuery(
    async () => await pg.query(query, params),
    {
      success: 'InsertActivityForPost function worked successfully',
      error: 'InsertActivityForPost function failed: '
    }
  )
  return {blockNumber, eventIndex};
};

export const insertActivityForPostReaction = async (eventAction: SubstrateEvent, count: number, ids: SubstrateId[], creator: string): InsertActivityPromise => {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post reaction')
    return undefined
  }

  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;

  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, post_id, date, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`
  const date = await getValidDate(blockNumber)
  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, count, aggregated];

  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      const postId = paramsIds.pop();
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE block_number <> $1
            AND event_index <> $2
            AND event = $3
            AND aggregated = true
            AND post_id = $4
        RETURNING *`;

      const paramsUpdate = [blockNumber, eventIndex, eventName, postId];
      const resUpdate = await pg.query(queryUpdate, paramsUpdate);
      updateCountLog(resUpdate.rowCount)
    },
    {
      success: 'InsertActivityForPostReaction function worked successfully',
      error: 'InsertActivityForPostReaction function failed: '
    }
  )
  return {blockNumber, eventIndex};
};

export const insertActivityForCommentReaction = async (eventAction: SubstrateEvent, count: number, ids: SubstrateId[], creator: string): InsertActivityPromise => {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment reaction')
    return undefined
  }

  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, post_id, comment_id, date, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`
  const date = await getValidDate(blockNumber)
  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, count, aggregated];
  
  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      const queryUpdate = `
        UPDATE df.activities
          SET aggregated = false
          WHERE block_number <> $1
            AND event_index <> $2
            AND event = $3
            AND: eventIndex aggregated = true
            AND post_id = $4
            AND comment_id = $5
        RETURNING *`;

      const paramsUpdate = [blockNumber, eventIndex, eventName, ...paramsIds];
      const resUpdate = await pg.query(queryUpdate, paramsUpdate);
      updateCountLog(resUpdate.rowCount)
    },
    {
      success: 'InsertActivityForCommentReaction function worked successfully',
      error: 'InsertActivityForCommentReaction function failed: '
    }
  )
  return {blockNumber, eventIndex};
}
