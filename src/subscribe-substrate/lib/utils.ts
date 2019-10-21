import { BlogId, PostId, CommentId, IpfsData, BlogData, PostData, CommentData, ProfileData } from '../../df-types/src/blogs';
import { getJsonFromIpfs } from '../../express-api/adaptors/ipfs';
import { AccountId } from '@polkadot/types';
import searchClient from '../../adaptors/connectElasticsearch'

require("dotenv").config();

// gets the event sections to filter on
// if not set in the .env file then all events are processed
export const getEventSections = () => {
    const sections = process.env.SUBSTRATE_EVENT_SECTIONS;
    if (sections) {
        return sections.split(",");
    } else {
        return ["all"];
    }
};

export const getEventMethods = () => {
    const methods = process.env.SUBSTRATE_EVENT_METHODS;
    if (methods) {
        return methods.split(",");
    } else {
        return ["all"];
    }
};

export type InsertData = BlogId | PostId | CommentId;

export function encodeStructId(id: InsertData): string {
    if (!id) return null;

    return id.toHex().split('x')[1].replace(/(0+)/, '');
}

export async function insertElasticSearch<T extends IpfsData>(index: string, ipfsHash: string, id: InsertData | AccountId, extData?: object) {
    const json = await getJsonFromIpfs<T>(ipfsHash);
    let indexData;

    switch (index) {
        case process.env.BLOGS_INDEX: {
            const { name, desc } = json as BlogData;
            indexData = { name, desc };
            break;
        }

        case process.env.POSTS_INDEX: {
            const { title, body } = json as PostData;
            indexData = { title, body };
            break;
        }

        case process.env.COMMENTS_INDEX: {
            const { body } = json as CommentData;
            indexData = { body };
            console.log('[*]\n' + indexData + '\n[*]');
            break;
        }

        case process.env.PROFILES_INDEX: {
            const { fullname, about } = json as ProfileData;
            indexData = { ...extData, fullname, about };
            break;
        }

        default:
            break;
    }

    await searchClient.index({
        index,
        id: id instanceof AccountId ? id.toString() : encodeStructId(id),
        body: indexData
    })
}