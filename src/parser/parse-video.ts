// Works with request '^2.88.0'
import * as request from 'request'

// Works with googleapis '^19.0.0'
import * as google from 'googleapis'
// import { youtube_v3 } from 'googleapis/build/src/apis/youtube/v3'
// import { GaxiosResponse } from 'gaxios';

import moment from 'moment'

import { nonEmptyStr } from './utils'

// Get from https://console.developers.google.com/apis/credentials?project=shodee-com
const API_KEY = 'AIzaSyC_1AraUnUfpNcaTxEhpyKljShJ3-Cj-Po';

google.options({ auth: API_KEY });

const youtube = google.youtube('v3');

// -----------------------------------------------------------
// Vimeo

const VIMEO_REGEX = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;

function extractVimeoVideoId (url: string) {
  const match = url.match(VIMEO_REGEX);
  if (match && match[3]) {
    return match[3];
  } else {
    return null;
  }
}

function isVimeoVideoUrl (url: string) {
  return extractVimeoVideoId(url) !== null;
}

type VideoObj = {
  url: string,
  video: Video
}

type ErrorObj = {
  err: string
}

function findVimeoVideoByUrl (videoUrl: string): Promise<VideoObj | ErrorObj> {

  const videoId = extractVimeoVideoId(videoUrl);
  // let url = `https://api.vimeo.com/videos/${videoId}`; // This API endpoint requires OAuth.
  const url = `http://vimeo.com/api/v2/video/${videoId}.json`;

  return new Promise((resolve) => {
    console.log(`\nRequest site at URL: ${url}`);
    request(
      {
        url: url,
        encoding: 'UTF-8',
        gzip: true
      },
      (error, res, body) => {

        let errorMessage = null;
        if (error) {
          errorMessage = `Error at URL [${url}]: ${error}`;
        } else if (res.statusCode === 200) {
          try {

            const videos = JSON.parse(body);
            console.log(`\nFound Vimeo videos by URL (${url}):\n`, videos);
            if (videos && videos.length > 0) {
              const v = videos[0];

              const ratio = v.width / v.height;
              const largeThumbHeight = parseInt((640 / ratio).toString());

              const video: Video = {
                generated: true,
                isVimeo: true,
                id: v.id as string,
                url: v.url as string,
                title: v.title as string,
                desc: v.description as string,
                date: moment(v.upload_date).format(),
                image: {
                  url: v.thumbnail_large as string,
                  width: 640,
                  height: largeThumbHeight
                },
                author: {
                  id: v.user_id as string,
                  url: v.user_url as string,
                  name: v.user_name as string
                }
              };
              resolve({ url: video.url, video });
              // resolve({ url: v.url, video: v });
              return;

            } else {
              errorMessage = `Vimeo video was not found by URL: ${videoUrl}`;
            }

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
        resolve({ err: errorMessage });
      }
    );
  });
}

// -----------------------------------------------------------
// YouTube

function findYouTubeVideoByUrl (url: string, onVideoFoundFn: (a: string | null, b: Video) => void) {
  const id = extractYouTubeVideoId(url);
  console.log(`findYouTubeVideoById id (${id}) url (${url})`);
  return findYouTubeVideoById(id, onVideoFoundFn);
}

const YOUTUBE_REGEXP = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

function extractYouTubeVideoId (url: string) {
  const match = url.match(YOUTUBE_REGEXP);
  if (match && match[2]) {
    return match[2];
  } else {
    return undefined;
  }
}

function isYouTubeUrl (url: string) {
  return extractYouTubeVideoId(url) !== null;
}

type Video = {
  generated: boolean,
  isYouTube?: boolean,
  isVimeo?: boolean,
  id: string,
  url: string,
  title: string,
  desc: string,
  date: string,
  snippet?: {
    title: string,
    description: string,
    publishedAt: string,
    thumbnails: {
      standard: Image
    },
    channelId: string,
    channelTitle: string
  },
  image: Image,
  author: {
    id: string,
    url: string,
    name: string
  }
}

type Image = {
  url: string,
  width: number,
  height: number
}

/*
interface VideoRes extends youtube_v3.Schema$VideoListResponse {
  items: Video[]
}

// res: GaxiosResponse<VideoRes>
*/

function findYouTubeVideoById (id: string | undefined, onVideoFoundFn: (a: string | Error, b?: Video) => void) {
  youtube.videos.list({ id, part: 'snippet' }, function (err: Error, res: any) {
    if (err || res.items.length === 0) {
      onVideoFoundFn(err);
      return;
    }
    const v = res.items[0];
    const video = {
      generated: true,
      isYouTube: true,

      id: v.id,
      // urlShort: `https://youtu.be/${v.id}`,
      url: `https://www.youtube.com/watch?v=${v.id}`,

      title: v.snippet.title || '',
      desc: v.snippet.description || '',
      date: v.snippet.publishedAt,
      image: v.snippet.thumbnails.standard,

      author: {
        id: v.snippet.channelId,
        url: `https://www.youtube.com/channel/${v.snippet.channelId}`,
        name: v.snippet.channelTitle
      }
    };
    console.log(`Video:`, video);
    onVideoFoundFn(null, video);
  });
}

function findYouTubeVideoPromise (url: string): Promise<ErrorObj | VideoObj> {
  return new Promise((resolve) => {
    findYouTubeVideoByUrl(url, (err, video) => {
      if (err) resolve({ err });
      else resolve({ url, video });
    });
  });
}

// General code --------------------------------------------------------------

export default function parse (videoUrls: string[]) {

  const findVidPromises: Array<VideoObj | ErrorObj> = []
  videoUrls = videoUrls.map(x => nonEmptyStr(x) ? x.trim() : x)
  videoUrls.forEach(async vidUrlOrVideo => {
    console.log(`videos.forEach(vidUrlOrVideo => `, vidUrlOrVideo);

    if (nonEmptyStr(vidUrlOrVideo)) {
      if (isYouTubeUrl(vidUrlOrVideo)) {
        findVidPromises.push(await findYouTubeVideoPromise(vidUrlOrVideo));
      } else if (isVimeoVideoUrl(vidUrlOrVideo)) {
        findVidPromises.push(await findVimeoVideoByUrl(vidUrlOrVideo));
      }
    }
  });

  return Promise.all(findVidPromises)
    .then(results => {
      console.log(`Video parser: Promise results`, results);

      const urlToVideoMap = new Map();
      results.forEach((res) => {
        const { url, video } = res as VideoObj;
        if (video) {
          urlToVideoMap.set(url, video);
        }
      });

      const parsedVideos: string[] = [];
      videoUrls.forEach(vidUrlOrVideo => {
        if (nonEmptyStr(vidUrlOrVideo) && urlToVideoMap.has(vidUrlOrVideo)) {
          vidUrlOrVideo = urlToVideoMap.get(vidUrlOrVideo);
        }
        parsedVideos.push(vidUrlOrVideo);
      });

      return { result: parsedVideos };
    })
    .catch(err => {
      const betterError = `Failed to parse videos: ${err}`;
      console.log(betterError);
      return { error: betterError };
    });
}
