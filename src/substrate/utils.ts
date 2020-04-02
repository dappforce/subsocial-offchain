import { SubstrateId } from '@subsocial/types/substrate/interfaces/utils'
import { CommentContent, BlogContent, CommonContent, PostContent, ProfileContent } from '@subsocial/types/offchain'
import { ipfs } from '../adaptors/connect-ipfs';
import { AccountId } from '@polkadot/types/interfaces';
import { GenericAccountId } from '@polkadot/types';
import searchClient from '../adaptors/connect-elasticsearch'
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from '../search/indexes';
import { bnToHex } from '@polkadot/util'
import { newLogger } from '@subsocial/utils';

const log = newLogger('Substrate utils')

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

export function encodeStructIds (ids: SubstrateId[]) {
  try {
    return ids.map(id => encodeStructId(id))
  } catch (err) {
    log.error('Failed to encode struct ids:', err)
    return []
  }

}

export function encodeStructId (id: SubstrateId): string {
  return bnToHex(id).split('x')[1].replace(/(0+)/, '');
}

function getJson<T extends CommonContent> (ipfsHash: string) {
  return ipfs.getContent<T>(ipfsHash);
}

export async function insertElasticSearch (index: string, ipfsHash: string, id: SubstrateId | AccountId, extData?: object) {

  let indexData;
  switch (index) {
    case ES_INDEX_BLOGS: {
      const content = await getJson<BlogContent>(ipfsHash)
      if (!content) return;

      const { name, desc } = content
      indexData = {
        blog_name: name,
        blog_desc: desc
      };
      break;
    }

    case ES_INDEX_POSTS: {
      const content = await getJson<PostContent>(ipfsHash)
      if (!content) return;

      const { title, body } = content
      indexData = {
        post_title: title,
        post_body: body
      };
      break;
    }

    case ES_INDEX_COMMENTS: {
      const content = await getJson<CommentContent>(ipfsHash)
      if (!content) return;

      const { body } = content
      indexData = {
        comment_body: body
      };
      break;
    }

    case ES_INDEX_PROFILES: {
      const content = await getJson<ProfileContent>(ipfsHash)
      if (!content) return;

      const { fullname, about } = content
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
