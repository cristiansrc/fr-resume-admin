import { axiosClient } from "./axiosClient";
import type { BlogListResponse } from "../interfaces/blog/BlogListResponse";
import type { BlogPayload } from "../interfaces/blog/BlogPayload";
import type { BlogResponse } from "../interfaces/blog/BlogResponse";

export type { BlogListResponse, BlogPayload, BlogResponse };

const BLOG_ENDPOINT = "/blog";

export const getBlogs = async (
  page: number,
  size: number,
  sort: string,
): Promise<BlogListResponse> => {
  const { data } = await axiosClient.get<BlogListResponse>(BLOG_ENDPOINT, {
    params: {
      page,
      size,
      sort,
    },
  });
  return data;
};

export const getBlog = async (id: number): Promise<BlogResponse> => {
  const { data } = await axiosClient.get<BlogResponse>(`${BLOG_ENDPOINT}/${id}`);
  return data;
};

interface BlogCreateResult {
  status: number;
}

interface BlogUpdateResult {
  status: number;
}

interface BlogDeleteResult {
  status: number;
}

export type { BlogCreateResult, BlogUpdateResult, BlogDeleteResult };

export const createBlog = async (
  payload: BlogPayload,
): Promise<BlogCreateResult> => {
  const response = await axiosClient.post(BLOG_ENDPOINT, payload);
  return { status: response.status };
};

export const updateBlog = async (
  id: number,
  payload: BlogPayload,
): Promise<BlogUpdateResult> => {
  const response = await axiosClient.put(`${BLOG_ENDPOINT}/${id}`, payload);
  return { status: response.status };
};

export const deleteBlog = async (id: number): Promise<BlogDeleteResult> => {
  const response = await axiosClient.delete(`${BLOG_ENDPOINT}/${id}`);
  return { status: response.status };
};
