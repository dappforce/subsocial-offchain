import { ActivitiesParamsWithAccount } from '../queries/types';
import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { IQueryParams } from '../types/fillNotificationsWithPostFollowers.queries';

export async function fillNotificationsWithPostFollowers(postId: string, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillTableWith("notifications", "post")
  const encodedPostId = encodeStructId(postId);
  const encodedBlockNumber = encodeStructId(blockNumber.toString())
  const params = { postId: encodedPostId, account, blockNumber: encodedBlockNumber, eventIndex };

  try {
    await runQuery<IQueryParams>(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithPostFollowers)
  }
}