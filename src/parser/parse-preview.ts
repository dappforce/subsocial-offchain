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
  title: string,
  desc: string,
  image: string,
  date: string,
  author: string
}

export default function parse (siteUrls: string[]) {

  const parseSitePromises: Promise<ParsedSite>[] = []
  siteUrls = siteUrls.map(x => nonEmptyStr(x) ? x.trim() : x)
  siteUrls.forEach(url => {
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
      siteUrls.forEach(pressUrl => {
        if (typeof pressUrl === 'object') {
          parsedPress.push(pressUrl);
          return;
        }

        const pressMeta = {
          generated: true,
          url: pressUrl,
          title: '',
          desc: '',
          image: '',
          date: '',
          author: ''
        };

        if (urlToMetaMap.has(pressUrl)) {
          const sm = urlToMetaMap.get(pressUrl);

          if (sm.og && sm.og.title) {
            pressMeta.title = sm.og.title;
          } else if (sm.twitter && sm.twitter.title) {
            pressMeta.title = sm.twitter.title;
          } else if (sm.title) {
            pressMeta.title = sm.title;
          }

          if (sm.og && sm.og.description) {
            pressMeta.desc = sm.og.description;
          } else if (sm.twitter && sm.twitter.description) {
            pressMeta.desc = sm.twitter.description;
          } else if (sm.description) {
            pressMeta.desc = sm.description;
          }

          if (sm.og && sm.og.image) {
            pressMeta.image = sm.og.image;
          } else if (sm.twitter && sm.twitter.image) {
            pressMeta.image = sm.twitter.image;
          }

          if (sm.og && sm.og.updated_time) {
            pressMeta.date = sm.og.updated_time;
          }

          if (sm.author) {
            pressMeta.author = sm.author;
          } else if (sm.twitter && sm.twitter.creator) {
            pressMeta.author = sm.twitter.creator;
          }
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