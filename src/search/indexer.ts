import { AccountId } from '@polkadot/types/interfaces';
import { GenericAccountId } from '@polkadot/types';
import { PostId, Post } from '@subsocial/types/substrate/interfaces';
import { BlogContent, CommonContent, PostContent, ProfileContent } from '@subsocial/types/offchain'
import { encodeStructId } from '../substrate/utils';
import { substrate } from '../substrate/subscribe';
import { ipfs } from '../connections/connect-ipfs';
import elastic from '../connections/connect-elasticsearch'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_PROFILES } from './config';
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

      let post = extData as Post;

      if (!post) {
        post = await substrate.findPost(id as PostId);
      }

      const { blog_id, extension } = post

      let blogId;

      if (extension.isComment) {
        const rootPost = await substrate.findPost(extension.asComment.root_post_id);
        const blogIdOpt = rootPost.blog_id;
        blogId  = blogIdOpt.unwrapOr(undefined)
      } else {
        blogId  = blog_id.unwrapOr(undefined)  
      }

      console.log('Blog Id:', blogId);

      indexData = {
        blog_id: encodeStructId(blogId),
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
