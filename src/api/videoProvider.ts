import { VIDEO_RESOURCE } from "../config/video-config";
import { axiosClient } from "./axiosClient";
import type { VideoPayload } from "../interfaces/video/VideoPayload";
import type { VideoResponse } from "../interfaces/video/VideoResponse";

export type { VideoPayload, VideoResponse };

const VIDEO_ENDPOINT = `/${VIDEO_RESOURCE}`;

export const getVideos = async (): Promise<VideoResponse[]> => {
  const { data } = await axiosClient.get<VideoResponse[]>(VIDEO_ENDPOINT);
  return data;
};

interface VideoCreateResult {
  data: VideoResponse;
  status: number;
}

interface VideoDeleteResult {
  status: number;
}

export type { VideoCreateResult, VideoDeleteResult };

export const createVideo = async (
  payload: VideoPayload,
): Promise<VideoCreateResult> => {
  const response = await axiosClient.post<VideoResponse>(VIDEO_ENDPOINT, payload);
  return {
    data: response.data,
    status: response.status,
  };
};

export const deleteVideo = async (id: number): Promise<VideoDeleteResult> => {
  const response = await axiosClient.delete(`${VIDEO_ENDPOINT}/${id}`);
  return {
    status: response.status,
  };
};
