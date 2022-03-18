import { readFileSync } from "fs";
import { create } from "handlebars";
// import { FeedTemplateProp } from "../types";

export const h = create()

export type TemplateType = 'notifications' | 'feed' | 'confirmation'

const getTemplate = (path) => {
  const source = readFileSync(`${__dirname}/${path}.hbs`, 'utf8');
	return h.compile(source)
}

const getGeneralTemplate = (type: 'confirmation' | 'activity') => getTemplate(`${type}/html`)

const getActivityTemplate = (path: string) => getTemplate(`activity/${path}`)

h.registerPartial('feed', getActivityTemplate('feed'));
h.registerPartial('notifications', getActivityTemplate('notifications'));
h.registerPartial('feedItem', getActivityTemplate('feed-item'));
h.registerPartial('postAuthor', getActivityTemplate('post/post-author'));
h.registerPartial('postContent', getActivityTemplate('post/post-content'));
h.registerPartial('postImg', getActivityTemplate('post/post-image'));
h.registerPartial('css', readFileSync(`${__dirname}/style.css`, 'utf8'))

export const templates: Record<TemplateType, HandlebarsTemplateDelegate<any>> = { 
  notifications: getGeneralTemplate('activity'),
  feed: getGeneralTemplate('activity'),
  confirmation: getGeneralTemplate('confirmation')
}

export default templates

