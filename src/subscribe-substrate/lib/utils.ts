import { } from '@subsocial/types/substrate'
import { CommentContent, BlogContent, CommonContent, PostContent, ProfileContent } from '@subsocial/types/offchain'
import { ipfs } from '../../express-api/server';
import { AccountId } from '@polkadot/types/interfaces';
import { GenericAccountId } from '@polkadot/types';
import searchClient from '../../adaptors/connectElasticsearch'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from '../../search/indexes';
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

export function encodeStructId (id: InsertData): string {
  if (!id) return '';

  return id.toHex().split('x')[1].replace(/(0+)/, '');
}

export async function insertElasticSearch<T extends CommonContent> (index: string, ipfsHash: string, id: InsertData | AccountId, extData?: object) {
  const json = await ipfs.getContentArray<T>([ ipfsHash ]);
  let indexData;

  switch (index) {
    case ES_INDEX_BLOGS: {
      const { name, desc } = json as unknown as BlogContent;
      indexData = {
        blog_name: name,
        blog_desc: desc
      };
      break;
    }

    case ES_INDEX_POSTS: {
      const { title, body } = json as unknown as PostContent;
      indexData = {
        post_title: title,
        post_body: body
      };
      break;
    }

    case ES_INDEX_COMMENTS: {
      const { body } = json as unknown as CommentContent;
      indexData = {
        comment_body: body
      };
      break;
    }

    case ES_INDEX_PROFILES: {
      const { fullname, about } = json as unknown as ProfileContent;
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
