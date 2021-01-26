import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { EventHandlerFn } from '../../substrate/types';
import { indexSpaceContent } from '../indexer';

export const onSpaceUpdated: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const spaceId = data[1] as SpaceId;

  const { substrate } = await resolveSubsocialApi()

  const space = await substrate.findSpace({ id: spaceId });
  if (!space) return;

  await indexSpaceContent(space);
}
