import { readFileSync } from "fs";
import { compile } from "handlebars";

export type TemplateType = 'notifications' | 'feeds' | 'confirmation'

const getTemplate = (type) => {
  const source = readFileSync(`${__dirname}/${type}/html.hbs`, 'utf8');
	return compile(source)
}

export const templates: Record<TemplateType, HandlebarsTemplateDelegate<any>> = { 
  notifications: getTemplate('notifications'),
  feeds: getTemplate('feeds'),
  confirmation: getTemplate('confirmation')
}

export default templates

