import { BlogId, PostId, CommentId, IpfsData } from '../../df-types/src/blogs';
import { getJsonFromIpfs } from '../../express-api/adaptors/ipfs';

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

export function encodeStructId (id: InsertData): string {
    if(!id) return null;
  
    return id.toHex().split('x')[1].replace(/(0+)/,'');
}

export async function insertElasticSearch<T extends IpfsData>(ipfsHash: string, id: InsertData, extData?: object) {
   const ipfsJson = await getJsonFromIpfs<T>(ipfsHash);
   const json = extData ? { ...ipfsJson, ...extData } : ipfsJson;
   console.log('Elastic Data:');
   console.log(json);
}