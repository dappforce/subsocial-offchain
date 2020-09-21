import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_SPACES } from '../../search/config';
import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { resolveCidOfContent } from '@subsocial/api/utils';

export const onSpaceCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;

  const spaceId = data[1] as SpaceId;
  const space = await substrate.findSpace({ id: spaceId });
  if (!space) return;

  await indexContentFromIpfs(ES_INDEX_SPACES, resolveCidOfContent(space.content), spaceId);
}
