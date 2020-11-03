import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { createSubsocialConnect } from '../connections/connect-subsocial';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces';
import { indexPostContent, indexSpaceContent } from './event-handlers/utils';
import { elasticLog as log } from '../connections/loggers';
import { exit } from 'process';

const BN = require('bn.js');
const one = new BN(1)

async function reindexContentFromIpfs(substrate: SubsocialSubstrateApi) {
  const lastSpaceId = (await substrate.nextSpaceId()).sub(one)
  const lastPostId = (await substrate.nextPostId()).sub(one)

  for (let i = one; lastSpaceId.gte(i); i = i.add(one)) {
    const id: SpaceId = i as unknown as SpaceId
    const space = await substrate.findSpace({ id });

    indexSpaceContent(space)

    log.info(`Index space # ${id.toString()} out of ${lastSpaceId.toString()}`)
  }

  for (let i = one; lastPostId.gte(i); i = i.add(one)) {
    const id: PostId = i as unknown as PostId
    const post = await substrate.findPost({ id });

    indexPostContent(post)

    log.info(`Index post # ${id.toString()} out of ${lastPostId.toString()}`)
  }

  exit(0);
}

createSubsocialConnect()
  .then(({ substrate }) => reindexContentFromIpfs(substrate))
  .catch((error) => {
    log.error('Failed Elasticsearch reindexing:', error)
    exit(-1)
  })
