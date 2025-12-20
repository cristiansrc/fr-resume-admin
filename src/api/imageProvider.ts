import { IMAGE_RESOURCE } from "../config/image-config";
import { axiosClient } from "./axiosClient";
import type { ImagePayload } from "../interfaces/image/ImagePayload";
import type { ImageResponse } from "../interfaces/image/ImageResponse";

export type { ImagePayload, ImageResponse };

const IMAGE_ENDPOINT = `/${IMAGE_RESOURCE}`;

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
  const response = await axiosClient.post(IMAGE_ENDPOINT, payload);
  return {
    status: response.status,
  };
};

export const deleteImage = async (id: number): Promise<ImageDeleteResult> => {
  const response = await axiosClient.delete(`${IMAGE_ENDPOINT}/${id}`);
  return {
    status: response.status,
  };
};
