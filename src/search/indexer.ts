import { AccountId } from '@polkadot/types/interfaces';
import { GenericAccountId } from '@polkadot/types';
import { PostId, Post } from '@subsocial/types/substrate/interfaces';
import { SpaceContent, CommonContent, PostContent, ProfileContent } from '@subsocial/types/offchain'
import { encodeStructId } from '../substrate/utils';
import { substrate } from '../substrate/subscribe';
import { ipfs } from '../connections/connect-ipfs';
import elastic from '../connections/connect-elasticsearch'
import { ES_INDEX_SPACES, ES_INDEX_POSTS, ES_INDEX_PROFILES } from './config';
import { SubstrateId } from '@subsocial/types';

export async function indexContentFromIpfs (
  index: string,
  ipfsHash: string,
  id: SubstrateId | AccountId,
  extData?: object
) {

  function getContent<T extends CommonContent> () {
    return ipfs.getContent<T>(ipfsHash);
  }

  let indexData;
  switch (index) {
    case ES_INDEX_SPACES: {
      const content = await getContent<SpaceContent>()
      if (!content) return;

      const { name, desc, tags } = content
      indexData = {
        name,
        desc,
        tags
      };
      break;
    }

    case ES_INDEX_POSTS: {
      const content = await getContent<PostContent>()
      if (!content) return;

      const { title, body, tags } = content

      let post = extData as Post;

      if (!post) {
        post = await substrate.findPost({ id: id as PostId });
      }

      const { space_id, extension } = post

      let spaceId;

      if (extension.isComment) {
        const rootPost = await substrate.findPost({ id: extension.asComment.root_post_id });
        const spaceIdOpt = rootPost.space_id;
        spaceId  = spaceIdOpt.unwrapOr(undefined)
      } else {
        spaceId  = space_id.unwrapOr(undefined)  
      }

      console.log('Space Id:', spaceId);

      indexData = {
        space_id: encodeStructId(spaceId),
        title,
        body,
        tags,
      };
      break;
    }

    case ES_INDEX_PROFILES: {
      const content = await getContent<ProfileContent>()
      if (!content) return;

      const { fullname, about } = content
      indexData = {
        handle: extData && extData.toString(),
        fullname,
        about
      }
      break;
    }

    default:
      break;
  }

  if (indexData) {
    await elastic.index({
      index,
      id: id instanceof GenericAccountId ? id.toString() : encodeStructId(id),
      body: indexData
    })
  }
}
