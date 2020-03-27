import { } from '@subsocial/types/substrate'
import { CommentContent, BlogContent, CommonContent, PostContent, ProfileContent } from '@subsocial/types/offchain'
import { ipfs } from '../adaptors/connect-ipfs';
import { AccountId } from '@polkadot/types/interfaces';
import { GenericAccountId } from '@polkadot/types';
import searchClient from '../adaptors/connect-elasticsearch'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from '../search/indexes';
import { CommentId, BlogId, PostId } from '@subsocial/types/substrate/interfaces/subsocial';

require('dotenv').config();

// gets the event sections to filter on
// if not set in the .env file then all events are processed
export const getEventSections = () => {
  const sections = process.env.SUBSTRATE_EVENT_SECTIONS;
  if (sections) {
    return sections.split(',');
  } else {
    return [ 'all' ];
  }
};

export const getEventMethods = () => {
  const methods = process.env.SUBSTRATE_EVENT_METHODS;
  if (methods) {
    return methods.split(',');
  } else {
    return [ 'all' ];
  }
};

export type InsertData = BlogId | PostId | CommentId;

export function encodeStructId (id: InsertData): string | undefined {
  if (!id) return undefined;

  return id.toHex().split('x')[1].replace(/(0+)/, '');
}

function getJson<T extends CommonContent> (ipfsHash: string) {
  return ipfs.getContent<T>(ipfsHash);
}

export async function insertElasticSearch (index: string, ipfsHash: string, id: InsertData | AccountId, extData?: object) {

  let indexData;

  switch (index) {
    case ES_INDEX_BLOGS: {
      const { name, desc } = await getJson<BlogContent>(ipfsHash)
      indexData = {
        blog_name: name,
        blog_desc: desc
      };
      break;
    }

    case ES_INDEX_POSTS: {
      const { title, body } = await getJson<PostContent>(ipfsHash)
      indexData = {
        post_title: title,
        post_body: body
      };
      break;
    }

    case ES_INDEX_COMMENTS: {
      const { body } = await getJson<CommentContent>(ipfsHash)
      indexData = {
        comment_body: body
      };
      break;
    }

    case ES_INDEX_PROFILES: {
      const { fullname, about } = await getJson<ProfileContent>(ipfsHash)
      indexData = {
        profile_username: extData && extData.toString(),
        profile_fullname: fullname,
        profile_about: about
      }
      break;
    }

    default:
      break;
  }

  if (indexData) {
    await searchClient.index({
      index,
      id: id instanceof GenericAccountId ? id.toString() : encodeStructId(id),
      body: indexData
    })
  }
}
