import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { BlogListResponse } from "../../src/interfaces/blog/BlogListResponse";
import type { BlogPayload } from "../../src/interfaces/blog/BlogPayload";
import type { BlogResponse } from "../../src/interfaces/blog/BlogResponse";

vi.mock("../../src/api/axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const axiosMock = axiosClient as unknown as {
  get: vi.Mock;
  post: vi.Mock;
  put: vi.Mock;
  delete: vi.Mock;
};

const baseResponse: Omit<BlogResponse, "id"> = {
  title: "Blog",
  titleEng: "Blog EN",
  cleanUrlTitle: "blog",
  descriptionShort: "Short",
  description: "Desc",
  descriptionShortEng: "Short EN",
  descriptionEng: "Desc EN",
  imageUrl: { id: 1, name: "Img", nameEng: "Img EN", url: "https://img" },
  videoUrl: { id: 2, name: "Vid", nameEng: "Vid EN", url: "https://video" },
  blogType: { id: 3, name: "Tech", nameEng: "Tech EN" },
};

describe("blogProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.put.mockReset();
    axiosMock.delete.mockReset();
  });

  it("fetches blogs with pagination and returns data", async () => {
    const listResponse: BlogListResponse = {
      content: [{ id: 1, ...baseResponse }],
      pageable: {
        sort: { empty: true, sorted: false, unsorted: true },
        offset: 0,
        pageSize: 10,
        pageNumber: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalPages: 1,
      totalElements: 1,
      size: 10,
      number: 0,
      sort: { empty: true, sorted: false, unsorted: true },
      first: true,
      numberOfElements: 1,
      empty: false,
    };

    axiosMock.get.mockResolvedValueOnce({ data: listResponse });

    const { getBlogs } = await import("../../src/api/blogProvider");
    const result = await getBlogs(0, 10, "id,desc");

    expect(axiosMock.get).toHaveBeenCalledWith("/blog", {
      params: { page: 0, size: 10, sort: "id,desc" },
    });
    expect(result).toEqual(listResponse);
  });

  it("fetches a blog by id", async () => {
    const blog = { id: 9, ...baseResponse };
    axiosMock.get.mockResolvedValueOnce({ data: blog });

    const { getBlog } = await import("../../src/api/blogProvider");
    const result = await getBlog(9);

    expect(axiosMock.get).toHaveBeenCalledWith("/blog/9");
    expect(result).toEqual(blog);
  });

  it("creates a blog and returns status", async () => {
    const payload: BlogPayload = {
      title: "Blog",
      titleEng: "Blog EN",
      cleanUrlTitle: "blog",
      descriptionShort: "Short",
      description: "Desc",
      descriptionShortEng: "Short EN",
      descriptionEng: "Desc EN",
      imageUrlId: 1,
      videoUrlId: 2,
      blogTypeId: 3,
    };
    axiosMock.post.mockResolvedValueOnce({ status: 201 });

    const { createBlog } = await import("../../src/api/blogProvider");
    const result = await createBlog(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/blog", payload);
    expect(result).toEqual({ status: 201 });
  });

  it("updates a blog and returns status", async () => {
    const payload: BlogPayload = {
      title: "Blog",
      titleEng: "Blog EN",
      cleanUrlTitle: "blog",
      descriptionShort: "Short",
      description: "Desc",
      descriptionShortEng: "Short EN",
      descriptionEng: "Desc EN",
      imageUrlId: 1,
      videoUrlId: 2,
      blogTypeId: 3,
    };
    axiosMock.put.mockResolvedValueOnce({ status: 204 });

    const { updateBlog } = await import("../../src/api/blogProvider");
    const result = await updateBlog(4, payload);

    expect(axiosMock.put).toHaveBeenCalledWith("/blog/4", payload);
    expect(result).toEqual({ status: 204 });
  });

  it("deletes a blog by id and returns status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteBlog } = await import("../../src/api/blogProvider");
    const result = await deleteBlog(12);

    expect(axiosMock.delete).toHaveBeenCalledWith("/blog/12");
    expect(result).toEqual({ status: 204 });
  });
});
