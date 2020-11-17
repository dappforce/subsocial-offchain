import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { findSpace } from '../../substrate/api-wrappers';
import { EventHandlerFn } from '../../substrate/types';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { insertActivityForSpace } from '../inserts/insertActivityForSpace';

export const onSpaceCreated: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const account = data[0].toString();
  const insertResult = await insertActivityForSpace(eventAction, 0);
  if(insertResult === undefined) return

  await fillNotificationsWithAccountFollowers({ account, ...insertResult });

  const spaceId = data[1] as SpaceId;
  const space = await findSpace(spaceId);
  if (!space) return;
}
