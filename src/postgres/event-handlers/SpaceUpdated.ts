import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { findSpace } from '../../substrate/api-wrappers';
import { EventHandlerFn } from '../../substrate/types';

export const onSpaceUpdated: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const spaceId = data[1] as SpaceId;
  const space = await findSpace(spaceId);
  if (!space) return;
}
