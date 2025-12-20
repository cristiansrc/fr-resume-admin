const YOUTUBE_ID_PATTERN =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/;

export const getYoutubeVideoId = (url: string) => {
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match?.[1];
};

export const getYoutubePreviewUrl = (url: string) => {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;
};

export const isYoutubeUrlValid = (url?: string) =>
  Boolean(url && getYoutubeVideoId(url));
