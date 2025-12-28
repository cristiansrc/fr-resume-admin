import type { ImageResponse } from "../image/ImageResponse";
import type { VideoResponse } from "../video/VideoResponse";
import type { BlogTypeResponse } from "../blog-type/BlogTypeResponse";

export interface BlogResponse {
  id: number;
  title: string;
  titleEng: string;
  cleanUrlTitle?: string;
  descriptionShort: string;
  description: string;
  descriptionShortEng: string;
  descriptionEng: string;
  imageUrl: ImageResponse;
  videoUrl: VideoResponse;
  blogType: BlogTypeResponse;
}
