// Works with request '^2.88.0'
import request from 'request'

// Works with cheerio '^1.0.0-rc.2'
import * as cheerio from 'cheerio'
import { newLogger, nonEmptyStr } from '@subsocial/utils';

const log = newLogger('SiteParser')

export function $loadHtml (html: string) {
  // 'decodeEntities = true' is to convert HTML entities like '&amp' to '&', etc.
  return cheerio.load(html, { decodeEntities: true });
}

export type ParsedSite = {
  ok: boolean,
  url?: string,
  data?: any,
  error?: string
}

type ParseFn = (url: string, body: any) => any

export function parseSiteWithRequest (url: string, parseFn: ParseFn): Promise<ParsedSite> {
  return new Promise((resolve) => {
    log.debug(`Parsing data of the site at URL: ${url}`);
    request(
      {
        url: url,
        encoding: 'UTF-8',
        gzip: true,
        headers: {
            'User-Agent': 'Chrome/59.0.3071.115'
        }
      },
      (error, res, body) => {

        let errorMessage = null;
        if (error) {
          errorMessage = `Error at URL [${url}]: ${error}`;
        } else if (res.statusCode === 200) {
          try {
            const data = parseFn(url, body);
            resolve({ ok: true, url, data });
            return;

          } catch (ex) {
            errorMessage = ex;
          }
        } else if (res.statusCode === 404) {
          errorMessage = `Page not found at URL [${url}]. HTTP error: ${res.statusCode}`;
        } else if (res.statusCode === 503) {
          errorMessage = `Server error at URL [${url}]. HTTP error: ${res.statusCode}`;
        } else {
          errorMessage = `Unexpected HTTP status code at URL [${url}]. HTTP error: ${res.statusCode}`;
        }

        console.error(errorMessage);

        // TODO Use reject() here? yes
        resolve({ ok: false, error: errorMessage });
      }
    );
  });
}

export function getPrettyString (getStringFn: () => string | undefined) {
  let prettyVal;
  try {
    const value = getStringFn();
    if (value && nonEmptyStr(value)) {
      prettyVal = value
        .replace(/(\n|\r|\r\n)+/, ' ')
        .replace(/[ ]+/, ' ')
        .trim()
      ;
      if (prettyVal === '') {
        prettyVal = undefined;
      }
    }
  } catch (e) {}
  return prettyVal;
}

export function setPrettyString <T>(obj: T, propName: string, getValueFn: () => string | undefined) {
  const value = getPrettyString(getValueFn);
  if (typeof value !== 'undefined') {
    obj[propName] = value;
  }
}