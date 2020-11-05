import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { pg } from '../../connections/postgres';
import { newPgError } from '../utils';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';

export async function fillNewsFeedWithSpaceFollowers(spaceId: SpaceId, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillTableWith("news_feed", "space")
  const encodedSpaceId = encodeStructId(spaceId);
  const params = [encodedSpaceId, account, blockNumber, eventIndex];

  try {
    await pg.query(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNewsFeedWithSpaceFollowers)
  }
}