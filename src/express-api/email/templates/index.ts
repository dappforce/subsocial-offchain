import { readFileSync } from "fs";
import { compile } from "handlebars";
// import { FeedTemplateProp } from "../types";

export type TemplateType = 'notifications' | 'feed' | 'confirmation'

const getTemplate = (path) => {
  const source = readFileSync(`${__dirname}/${path}.hbs`, 'utf8');
	return compile(source)
}

const getGeneralTemplate = (type: 'confirmation' | 'activity') => getTemplate(`${type}/html`)

// const activityTemplate = getGeneralTemplate('activity')

const getActivity = (type: 'feed' | 'notifications') => getTemplate(`activity/${type}`)
// {
//   const template = getTemplate(`activity/${type}`)

//   return (data: FeedTemplateProp) => activityTemplate({
//     data: template({ data })
//   })
// }

export const templates: Record<TemplateType, HandlebarsTemplateDelegate<any>> = { 
  notifications: getActivity('notifications'),
  feed: getActivity('feed'),
  confirmation: getGeneralTemplate('confirmation')
}

export default templates

