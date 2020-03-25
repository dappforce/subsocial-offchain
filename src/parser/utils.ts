export const isStr = (x: any): boolean =>
  typeof x === 'string';

export const nonEmptyStr = (x?: any) =>
  isStr(x) && x.trim().length > 0;

export const isVideo = (url: string) => {
  const VIMEO_REGEX = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const YOUTUBE_REGEXP = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

  if (url.match(YOUTUBE_REGEXP) || url.match(VIMEO_REGEX)) return true
  return false
}
