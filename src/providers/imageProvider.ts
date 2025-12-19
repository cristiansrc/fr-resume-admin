import axios from "axios";
import { IMAGE_RESOURCE } from "../config/image-config";
import { TOKEN_KEY } from "./authProvider";
import type { ImagePayload } from "../interfaces/image/ImagePayload";
import type { ImageResponse } from "../interfaces/image/ImageResponse";

export type { ImagePayload, ImageResponse };

const API_URL = import.meta.env.VITE_API_URL ?? "";
const IMAGE_ENDPOINT = `${API_URL}/${IMAGE_RESOURCE}`;

const getRequestHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface ImageCreateResult {
  status: number;
}

interface ImageDeleteResult {
  status: number;
}

export type { ImageCreateResult, ImageDeleteResult };

export const createImage = async (
  payload: ImagePayload,
): Promise<ImageCreateResult> => {
  const response = await axios.post(IMAGE_ENDPOINT, payload, {
    headers: getRequestHeaders(),
  });
  return {
    status: response.status,
  };
};

export const deleteImage = async (id: number): Promise<ImageDeleteResult> => {
  const response = await axios.delete(`${IMAGE_ENDPOINT}/${id}`, {
    headers: getRequestHeaders(),
  });
  return {
    status: response.status,
  };
};
