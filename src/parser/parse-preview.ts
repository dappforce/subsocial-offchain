import { $loadHtml, parseSiteWithRequest, ParsedSite, getPrettyString, setPrettyString } from './parse-site';
import { nonEmptyStr, newLogger } from '@subsocial/utils';

const log = newLogger('SitePreviewParser')

type Meta = {
  title?: string,
  description?: string,
  author?: string,
  fb?: Fb,
  og: Og,
  twitter?: Twitter,
  keywords?: string[]
}

type Fb = {
  appId?: string
}

type Og = {
  title?: string,
  description?: string,
  image?: string,
  url?: string,
  type?: string,
  updated_time?: string
}

type Twitter = {
  title?: string,
  description?: string,
  image?: string,
  creator?: string
}

function parseSiteHtml (url: string, html: string) {
  const $ = $loadHtml(html);

  const meta: Meta = {
    fb: {},
    og: {},
    twitter: {}
  };

  setPrettyPreviewString(meta, 'title', () => $('title').text());
  setPrettyPreviewString(meta, 'description', () => $('meta[name="description"]').attr('content'));
  setPrettyPreviewString(meta, 'author', () => $('meta[name="author"]').attr('content'));

  setPrettyPreviewString(meta.og, 'title', () => $('meta[property="og:title"]').attr('content'));
  setPrettyPreviewString(meta.og, 'description', () => $('meta[property="og:description"]').attr('content'));
  setPrettyPreviewString(meta.og, 'image', () => $('meta[property="og:image"]').attr('content'));
  setPrettyPreviewString(meta.og, 'type', () => $('meta[property="og:type"]').attr('content'));
  setPrettyPreviewString(meta.og, 'url', () => $('meta[property="og:url"]').attr('content'));
  setPrettyPreviewString(meta.og, 'updated_time', () => $('meta[property="og:updated_time"]').attr('content'));

  setPrettyPreviewString(meta.fb, 'appId', () => $('meta[property="fb:app_id"]').attr('content'));

  setPrettyPreviewString(meta.twitter, 'title', () => $('meta[property="twitter:title"]').attr('content'));
  setPrettyPreviewString(meta.twitter, 'description', () => $('meta[property="twitter:description"]').attr('content'));
  setPrettyPreviewString(meta.twitter, 'image', () => $('meta[property="twitter:image"]').attr('content'));
  setPrettyPreviewString(meta.twitter, 'creator', () => $('meta[property="twitter:creator"]').attr('content'));

  const kws = getPrettyString(() => $('meta[name="keywords"]').attr('content'));
  if (typeof kws !== 'undefined' && kws.length > 0) {
    meta.keywords = kws.split(',').map((kw: string) => getPrettyString(() => kw));
  }

  deleteEmptyKeys(meta);

  log.debug(`\nParsed HTML meta of the site ${url}:\n`, meta);

  return meta;
}

function deleteEmptyKeys (obj: Meta) {
  Object.keys(obj).forEach(k => {
    const v = obj[k];
    if (typeof v === 'object' && Object.keys(v).length === 0) {
      delete obj[k];
    }
  });
}

const setPrettyPreviewString = (obj: Meta | Og | Fb | Twitter, propName: string, getValueFn: () => string | undefined) => 
  setPrettyString(obj, propName, getValueFn)

// TODO make all the fields optional except 'url'
type PressMeta = {
  generated: boolean, // TODO delete 'generated' field
  url: string,
  title?: string,
  desc?: string,
  image?: string,
  date?: string,
  author?: string
}

const multiSourceKeys = ['title', 'description', 'image']

export default function parse (siteUrls: string[] | string) {

  let urls = Array.isArray(siteUrls) ? siteUrls : [ siteUrls ]

  const parseSitePromises: Promise<ParsedSite>[] = []
  urls = urls.map(x => nonEmptyStr(x) ? x.trim() : x)
  urls.forEach(url => {
    if (nonEmptyStr(url)) {
      parseSitePromises.push(
        parseSiteWithRequest(url, parseSiteHtml)
          .catch((err) => {
            const errMsg = `Failed to parse a preview of the site ${url}. Error: ${err}`
            log.error(errMsg)
            return { ok: false, error: errMsg }
          }));
    }
  });

  return Promise.all(parseSitePromises)
    .then(results => {

      const urlToMetaMap = new Map();
      results.forEach(({ url, data: siteMeta }) => {
        urlToMetaMap.set(url, siteMeta);
      });

      const parsedPress: PressMeta[] = [];
      urls.forEach(pressUrl => {
        if (typeof pressUrl === 'object') {
          parsedPress.push(pressUrl);
          return;
        }

        const pressMeta: PressMeta = {
          generated: true,
          url: pressUrl,
        };

        if (urlToMetaMap.has(pressUrl)) {
          const sm = urlToMetaMap.get(pressUrl);

          multiSourceKeys.forEach(key => {
            pressMeta[key] = sm?.og[key] || sm?.twitter[key] || sm[key]
          })

          pressMeta.date = sm?.og?.updated_time;
          pressMeta.author = sm?.author || sm?.twitter?.creator;

        }
        parsedPress.push(pressMeta);
      });

      return { result: parsedPress };
    })
    .catch(err => {
      const errorMsg = `Unexpected error occured while parsing site previews: ${err}`;
      console.error(errorMsg);
      return { error: errorMsg };
    });
}