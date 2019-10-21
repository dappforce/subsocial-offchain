import { BlogId, PostId, CommentId } from '../../df-types/src/blogs';

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