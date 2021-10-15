import { readFileSync } from "fs";
import handlebars from "handlebars";
// import { FeedTemplateProp } from "../types";

export type TemplateType = 'notifications' | 'feed' | 'confirmation'

const getTemplate = (path) => {
  const source = readFileSync(`${__dirname}/${path}.hbs`, 'utf8');
	return handlebars.compile(source)
}

const getGeneralTemplate = (type: 'confirmation' | 'activity') => getTemplate(`${type}/html`)

const getActivityTemplate = (path: string) => getTemplate(`activity/${path}`)

const partials = {
  'feed': getActivityTemplate('feed'),
  'notifications': getActivityTemplate('notifications'),
  'feedItem': getActivityTemplate('feed-item'),
  'postAuthor': getActivityTemplate('post/post-author'),
  'postContent': getActivityTemplate('post/post-content'),
  'postImg': getActivityTemplate('post/post-image'),
  'css': handlebars.compile(readFileSync(`${__dirname}/style.css`, 'utf8'))
}

handlebars.registerPartial(partials)

export const templates: Record<TemplateType, HandlebarsTemplateDelegate<any>> = { 
  notifications: getGeneralTemplate('activity'),
  feed: getGeneralTemplate('activity'),
  confirmation: getGeneralTemplate('confirmation')
}

export default templates

