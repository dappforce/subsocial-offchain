import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../connections/subsocial';
import { fillNotificationsWithAccountFollowers } from '../fill-activity';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { insertActivityForSpace } from '../inserts/insertActivityForSpace';

export const onSpaceCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const account = data[0].toString();
  const insertResult = await insertActivityForSpace(eventAction, 0);
  if(insertResult === undefined) return

  await fillNotificationsWithAccountFollowers({ account, ...insertResult });

  const spaceId = data[1] as SpaceId;
  const space = await substrate.findSpace({ id: spaceId });
  if (!space) return;
}
