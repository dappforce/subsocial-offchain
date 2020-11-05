import { PostId } from '@subsocial/types/substrate/interfaces';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';

export async function fillNotificationsWithPostFollowers(postId: PostId, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillTableWith("notifications", "post")
  const encodedPostId = encodeStructId(postId);
  const params = [encodedPostId, account, blockNumber, eventIndex];

  try {
    await pg.query(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithPostFollowers)
  }
}