import { $loadHtml, parseSiteWithRequest, ParsedSite, setPrettyString } from './parse-site';
import { nonEmptyStr, newLogger, isDef } from '@subsocial/utils';

const log = newLogger('SitePreviewParser')

export type About = {
  name: string,
  handle: string,
  image?: string,
  about?: string
}

function parseMediumHtml (url: string, html: string) {
  const $ = $loadHtml(html);

  const urlArr = url.split('/')

  const about: About = {
    name: '',
    handle: urlArr[urlArr.length - 2]
  }

  const $aboutElement = $($('.col')[0])

  setPrettyAboutString(about, 'name', () => $aboutElement.find('.infoCard-wrapper > a').text());
  setPrettyAboutString(about, 'image', () => $aboutElement.find('.infoCard-avatar > a > img').attr('src'));
  setPrettyAboutString(about, 'about', () => $aboutElement.find('.infoCard-bio').text());

  log.debug(`\nParsed HTML meta of the site ${url}:\n`, about);

  return about;
}

const setPrettyAboutString = (obj: About, propName: keyof About, getValueFn: () => string | undefined) => setPrettyString(obj, propName, getValueFn)

export default function parseMedium (siteUrls: string[]) {

  const parseSitePromises: Promise<ParsedSite>[] = []
  siteUrls = siteUrls.map(x => nonEmptyStr(x) ? `${x.trim()}/about` : undefined).filter(x => isDef(x))
  siteUrls.forEach(url => {
    if (nonEmptyStr(url)) {
      parseSitePromises.push(
        parseSiteWithRequest(url, parseMediumHtml)
          .catch((err) => {
            const errMsg = `Failed to parse a preview of the site ${url}. Error: ${err}`
            log.error(errMsg)
            return { ok: false, error: errMsg }
          }));
    }
  });

  return Promise.all(parseSitePromises)
    .then(results => {

      const abouts = results.map(({ data: about }) => {
        return about
      }).filter(x => isDef(x));

      return abouts;
    })
    .catch(err => {
      const errorMsg = `Unexpected error occured while parsing site previews: ${err}`;
      console.error(errorMsg);
      return { error: errorMsg };
    });
}