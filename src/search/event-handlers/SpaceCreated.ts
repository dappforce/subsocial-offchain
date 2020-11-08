import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../connections/subsocial';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { indexSpaceContent } from '../indexer';

export const onSpaceCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;

  const spaceId = data[1] as SpaceId;
  const space = await substrate.findSpace({ id: spaceId });
  if (!space) return;

  await indexSpaceContent(space);
}
