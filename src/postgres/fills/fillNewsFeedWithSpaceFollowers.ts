import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { pg } from '../../connections/postgres';
import { updateCountOfUnreadNotifications } from '../notifications';
import { newPgError } from '../utils';

export const fillNewsFeedWithSpaceFollowers = async (spaceId: SpaceId, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
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