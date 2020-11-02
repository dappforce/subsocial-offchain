import { AccountId } from '@polkadot/types/interfaces';
import { GenericAccountId } from '@polkadot/types';
import { PostId, Post, Space } from '@subsocial/types/substrate/interfaces';
import { SpaceContent, CommonContent, PostContent, ProfileContent } from '@subsocial/types/offchain'
import { encodeStructId } from '../substrate/utils';
import { elasticIndexer } from '../connections/connect-elasticsearch'
import { ES_INDEX_SPACES, ES_INDEX_POSTS, ES_INDEX_PROFILES } from './config';
import { SubstrateId } from '@subsocial/types';
import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { ipfs, substrate } from '../connections/connect-subsocial';

export async function indexContentFromIpfs (
  index: string,
  ipfsHash: string,
  id: SubstrateId | AccountId,
  struct?: Space | Post
) {

  function getContent<T extends CommonContent> () {
    return ipfs.getContent<T>(ipfsHash);
  }

  let indexData;
  switch (index) {
    case ES_INDEX_SPACES: {
      const content = await getContent<SpaceContent>()
      if (!content) return;

      let space = struct as Space
      if (!space) {
        space = await substrate.findSpace({ id: id as SpaceId });
      }

      const { name, about, tags } = content
      indexData = {
        name,
        handle: space.handle,
        about,
        tags
      };
      break;
    }

    // Index posts and comments:
    case ES_INDEX_POSTS: {
      const content = await getContent<PostContent>()
      if (!content) return;

      const { title, body, tags } = content

      let post = struct as Post;

      if (!post) {
        post = await substrate.findPost({ id: id as PostId });
      }

      const { space_id, extension } = post

      let spaceId;

      if (extension.isComment) {
        const rootPost = await substrate.findPost({ id: extension.asComment.root_post_id });
        const spaceIdOpt = rootPost.space_id;
        spaceId = spaceIdOpt.unwrapOr(undefined)
      } else {
        spaceId = space_id.unwrapOr(undefined)
      }

      indexData = {
        space_id: encodeStructId(spaceId),
        title,
        body,
        tags,
      };
      break;
    }

    // Index account profiles:
    case ES_INDEX_PROFILES: {
      const content = await getContent<ProfileContent>()
      if (!content) return;

      const { name, about } = content
      indexData = {
        name,
        about
      }
      break;
    }

    default:
      break;
  }

  if (indexData) {
    await elasticIndexer.index({
      index,
      id: id instanceof GenericAccountId ? id.toString() : encodeStructId(id),
      body: indexData
    })
  }
}
