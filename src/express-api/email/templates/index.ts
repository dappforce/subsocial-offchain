import { readFileSync } from "fs";
import { compile, registerPartial } from "handlebars";
// import { FeedTemplateProp } from "../types";

export type TemplateType = 'notifications' | 'feed' | 'confirmation'

const getTemplate = (path) => {
  const source = readFileSync(`${__dirname}/${path}.hbs`, 'utf8');
	return compile(source)
}

const getGeneralTemplate = (type: 'confirmation' | 'activity') => getTemplate(`${type}/html`)

const getActivityTemplate = (path: string) => getTemplate(`activity/${path}`)

registerPartial('feed', getActivityTemplate('feed'));
registerPartial('notifications', getActivityTemplate('notifications'));
registerPartial('feedItem', getActivityTemplate('feed-item'));
registerPartial('postAuthor', getActivityTemplate('post/post-author'));
registerPartial('postContent', getActivityTemplate('post/post-content'));
registerPartial('postImg', getActivityTemplate('post/post-image'));
registerPartial('css', readFileSync(`${__dirname}/style.css`, 'utf8'))

export const templates: Record<TemplateType, HandlebarsTemplateDelegate<any>> = { 
  notifications: getGeneralTemplate('activity'),
  feed: getGeneralTemplate('activity'),
  confirmation: getGeneralTemplate('confirmation')
}

export default templates

