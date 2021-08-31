import { ActivitiesParamsWithAccount } from '../queries/types';
import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { IQueryParams } from '../types/fillNotificationsWithCommentFollowers.queries';

export async function fillNotificationsWithCommentFollowers(commentId: string, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillTableWith("notifications", "comment")
  const encodedCommentId = encodeStructId(commentId);
  const encodedBlockNumber = encodeStructId(blockNumber.toString())
  const params = { commentId: encodedCommentId, account, blockNumber: encodedBlockNumber, eventIndex };

  try {
    await runQuery<IQueryParams>(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithCommentFollowers)
  }
}