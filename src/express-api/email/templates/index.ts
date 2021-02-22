import { readFileSync } from "fs";
import { compile, registerPartial } from "handlebars";
// import { FeedTemplateProp } from "../types";

export type TemplateType = 'notifications' | 'feed' | 'confirmation'

const getTemplate = (path) => {
  const source = readFileSync(`${__dirname}/${path}.hbs`, 'utf8');
	return compile(source)
}

const getGeneralTemplate = (type: 'confirmation' | 'activity') => getTemplate(`${type}/html`)

const getActivityTemplate = (type: 'feed' | 'notifications') => getTemplate(`activity/${type}`)

registerPartial('feed', getActivityTemplate('feed'));
registerPartial('notifications', getActivityTemplate('notifications'));

export const templates: Record<TemplateType, HandlebarsTemplateDelegate<any>> = { 
  notifications: getGeneralTemplate('activity'),
  feed: getGeneralTemplate('activity'),
  confirmation: getGeneralTemplate('confirmation')
}

export default templates

