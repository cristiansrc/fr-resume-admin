import { axiosClient } from "./axiosClient";
import type { BlogTypePayload } from "../interfaces/blog-type/BlogTypePayload";
import type { BlogTypeResponse } from "../interfaces/blog-type/BlogTypeResponse";

export type { BlogTypePayload, BlogTypeResponse };

const BLOG_TYPE_ENDPOINT = "/blog-type";

export const getBlogTypes = async (): Promise<BlogTypeResponse[]> => {
  const { data } = await axiosClient.get<BlogTypeResponse[]>(BLOG_TYPE_ENDPOINT);
  return data;
};

export const getBlogType = async (id: number): Promise<BlogTypeResponse> => {
  const { data } = await axiosClient.get<BlogTypeResponse>(
    `${BLOG_TYPE_ENDPOINT}/${id}`,
  );
  return data;
};

interface BlogTypeCreateResult {
  status: number;
}

interface BlogTypeUpdateResult {
  status: number;
}

interface BlogTypeDeleteResult {
  status: number;
}

export type {
  BlogTypeCreateResult,
  BlogTypeUpdateResult,
  BlogTypeDeleteResult,
};

export const createBlogType = async (
  payload: BlogTypePayload,
): Promise<BlogTypeCreateResult> => {
  const response = await axiosClient.post(BLOG_TYPE_ENDPOINT, payload);
  return { status: response.status };
};

export const updateBlogType = async (
  id: number,
  payload: BlogTypePayload,
): Promise<BlogTypeUpdateResult> => {
  const response = await axiosClient.put(`${BLOG_TYPE_ENDPOINT}/${id}`, payload);
  return { status: response.status };
};

export const deleteBlogType = async (id: number): Promise<BlogTypeDeleteResult> => {
  const response = await axiosClient.delete(`${BLOG_TYPE_ENDPOINT}/${id}`);
  return { status: response.status };
};
