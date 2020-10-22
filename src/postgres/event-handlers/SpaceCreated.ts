import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertActivityForSpace } from '../insert-activity';
import { upsertSpace } from '../upsert-space';
import { fillNotificationsWithAccountFollowers } from '../fill-activity';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onSpaceCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const account = data[0].toString();

  const activityId = await insertActivityForSpace(eventAction, 0);
  await fillNotificationsWithAccountFollowers(account, activityId);  

  const spaceId = data[1] as SpaceId;
  const space = await substrate.findSpace({ id: spaceId });

  if (!space) return;

  await upsertSpace(space);
}
