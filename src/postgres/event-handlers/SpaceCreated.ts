import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertActivityForSpace } from '../insert-activity';
import { fillNotificationsWithAccountFollowers } from '../fill-activity';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onSpaceCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const account = data[0].toString();
  const insertResult = await insertActivityForSpace(eventAction, 0);
  if(insertResult === undefined) return

  const {blockNumber, eventIndex} = insertResult

  await fillNotificationsWithAccountFollowers(account, eventIndex, blockNumber);

  const spaceId = data[1] as SpaceId;
  const space = await substrate.findSpace({ id: spaceId });
  if (!space) return;
}
