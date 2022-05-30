import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { findSpace } from '../../substrate/api-wrappers';
import { EventHandlerFn } from '../../substrate/types';
import { indexSpaceContent } from '../indexer';

export const onSpaceCreated: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const spaceId = data[1] as SpaceId;

  const space = await findSpace(spaceId);
  if (!space) return;

  await indexSpaceContent(space);
}
