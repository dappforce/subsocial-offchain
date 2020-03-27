import { BlogId, PostId, CommentId, IpfsData, BlogData, PostData, CommentData, ProfileData } from '../../df-types/src/blogs';
import { getJsonFromIpfs } from '../../express-api/adaptors/ipfs';
import { AccountId } from '@polkadot/types';
import searchClient from '../../adaptors/connectElasticsearch'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from '../../search/indexes';

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

export function encodeStructId (id: InsertData): string {
  if (!id) return null;

  return id.toHex().split('x')[1].replace(/(0+)/, '');
}

export async function insertElasticSearch<T extends IpfsData> (index: string, ipfsHash: string, id: InsertData | AccountId, extData?: object) {
  const json = await getJsonFromIpfs<T>(ipfsHash);
  let indexData;

  switch (index) {
    case ES_INDEX_BLOGS: {
      const { name, desc } = json as BlogData;
      indexData = {
        blog_name: name,
        blog_desc: desc
      };
      break;
    }

    case ES_INDEX_POSTS: {
      const { title, blocks } = json as PostData;
      indexData = {
        post_title: title,
        post_body: blocks
      };
      break;
    }

    case ES_INDEX_COMMENTS: {
      const { body } = json as CommentData;
      indexData = {
        comment_body: body
      };
      break;
    }

    case ES_INDEX_PROFILES: {
      const { fullname, about } = json as ProfileData;
      indexData = {
        profile_username: extData.toString(),
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
      id: id instanceof AccountId ? id.toString() : encodeStructId(id),
      body: indexData
    })
  }
}
