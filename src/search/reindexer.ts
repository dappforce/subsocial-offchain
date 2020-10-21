import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { Api } from '@subsocial/api/substrateConnect';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces';
import { indexPostContent, indexSpaceContent } from './event-handlers/utils';

 async function reindexContentFromIpfs () {
	const api = await Api.connect(process.env.SUBSTRATE_URL)
  const substrate = new SubsocialSubstrateApi(api)
  let last_space_id = await substrate.nextSpaceId()

  // console.log("last space id:" ,last_space_id.toNumber())

  let last_post_id = await substrate.nextPostId()

	for (let i = 1; i < last_space_id.toNumber(); i++) {
		const space_id: SpaceId = i as unknown as SpaceId
		const space = await substrate.findSpace({ id: space_id});

    indexSpaceContent(space)
  }
  
  for (let i = 1; i < last_post_id.toNumber(); i++) {
		const post_id: PostId = i as unknown as PostId
		const post = await substrate.findPost({ id: post_id});

    indexPostContent(post)
  }

	api.disconnect();
}

reindexContentFromIpfs()