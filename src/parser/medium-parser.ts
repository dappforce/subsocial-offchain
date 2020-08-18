import parseMedium from "./parse-medium"
import { writeFileSync } from 'fs'
import { newLogger, nonEmptyStr, isEmptyArray } from '@subsocial/utils'
const csv = require('csvtojson')

const log = newLogger('SitePreviewParser')

const CSV_PATH = process.argv.pop()

type TableItem = {
  "Project name": string,
  "Web-page link": string,
  "Twitter": string,
  "Medium": string,
  "Github": string,
  "Telegram": string
}

const parse = async () => {
  const dataArr = await csv().fromFile(CSV_PATH) as TableItem[]
  const mediumUrls = dataArr.map(({ Medium }) => Medium).filter(x => nonEmptyStr(x) && x !== '-')
  log.info('Parsed medium urls: %o', mediumUrls)
  const abouts = await parseMedium(mediumUrls)

  if (isEmptyArray(abouts)) throw abouts

  writeFileSync(`medium.json`, JSON.stringify(abouts, null, 2))
}

parse().catch(err => log.error('Failed parse medium %o', err))
  

