import { AccountId } from '@polkadot/types/interfaces';
import { GenericAccountId } from '@polkadot/types';
import { PostId, SubstrateId } from '@subsocial/types/substrate/interfaces';
import { CommentContent, BlogContent, CommonContent, PostContent, ProfileContent } from '@subsocial/types/offchain'
import { encodeStructId } from '../substrate/utils';
import { substrate } from '../substrate/server';
import { ipfs } from '../adaptors/connect-ipfs';
import elastic from '../adaptors/connect-elasticsearch'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from './config';

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
    case ES_INDEX_BLOGS: {
      const content = await getContent<BlogContent>()
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
      const { blog_id } = await substrate.findPost(id as PostId);
      indexData = {
        blog_id: encodeStructId(blog_id),
        title,
        body,
        tags,
      };
      break;
    }

    case ES_INDEX_COMMENTS: {
      const content = await getContent<CommentContent>()
      if (!content) return;

      const { body } = content
      indexData = {
        body
      };
      break;
    }

    case ES_INDEX_PROFILES: {
      const content = await getContent<ProfileContent>()
      if (!content) return;

      const { fullname, about } = content
      indexData = {
        username: extData && extData.toString(),
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
