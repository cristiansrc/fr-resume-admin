import axios from "axios";
import { VIDEO_RESOURCE } from "../config/video-config";
import { TOKEN_KEY } from "./authProvider";
import type { VideoPayload } from "../interfaces/video/VideoPayload";
import type { VideoResponse } from "../interfaces/video/VideoResponse";

export type { VideoPayload, VideoResponse };

const API_URL = import.meta.env.VITE_API_URL ?? "";
const VIDEO_ENDPOINT = `${API_URL}/${VIDEO_RESOURCE}`;

const getRequestHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getVideos = async (): Promise<VideoResponse[]> => {
  const { data } = await axios.get<VideoResponse[]>(VIDEO_ENDPOINT, {
    headers: getRequestHeaders(),
  });
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
  const response = await axios.post<VideoResponse>(VIDEO_ENDPOINT, payload, {
    headers: getRequestHeaders(),
  });
  return {
    data: response.data,
    status: response.status,
  };
};

export const deleteVideo = async (id: number): Promise<VideoDeleteResult> => {
  const response = await axios.delete(`${VIDEO_ENDPOINT}/${id}`, {
    headers: getRequestHeaders(),
  });
  return {
    status: response.status,
  };
};
