import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { BlogTypePayload } from "../../src/interfaces/blog-type/BlogTypePayload";

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

describe("blogTypeProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.put.mockReset();
    axiosMock.delete.mockReset();
  });

  it("fetches blog types and returns data", async () => {
    const blogTypes = [{ id: 1, name: "Tech", nameEng: "Tech EN" }];
    axiosMock.get.mockResolvedValueOnce({ data: blogTypes });

    const { getBlogTypes } = await import("../../src/api/blogTypeProvider");
    const result = await getBlogTypes();

    expect(axiosMock.get).toHaveBeenCalledWith("/blog-type");
    expect(result).toEqual(blogTypes);
  });

  it("fetches a blog type by id", async () => {
    const blogType = { id: 3, name: "UX", nameEng: "UX EN" };
    axiosMock.get.mockResolvedValueOnce({ data: blogType });

    const { getBlogType } = await import("../../src/api/blogTypeProvider");
    const result = await getBlogType(3);

    expect(axiosMock.get).toHaveBeenCalledWith("/blog-type/3");
    expect(result).toEqual(blogType);
  });

  it("creates a blog type and returns status", async () => {
    const payload: BlogTypePayload = { name: "Tech", nameEng: "Tech EN" };
    axiosMock.post.mockResolvedValueOnce({ status: 201 });

    const { createBlogType } = await import("../../src/api/blogTypeProvider");
    const result = await createBlogType(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/blog-type", payload);
    expect(result).toEqual({ status: 201 });
  });

  it("updates a blog type and returns status", async () => {
    const payload: BlogTypePayload = { name: "UX", nameEng: "UX EN" };
    axiosMock.put.mockResolvedValueOnce({ status: 204 });

    const { updateBlogType } = await import("../../src/api/blogTypeProvider");
    const result = await updateBlogType(7, payload);

    expect(axiosMock.put).toHaveBeenCalledWith("/blog-type/7", payload);
    expect(result).toEqual({ status: 204 });
  });

  it("deletes a blog type by id and returns status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteBlogType } = await import("../../src/api/blogTypeProvider");
    const result = await deleteBlogType(5);

    expect(axiosMock.delete).toHaveBeenCalledWith("/blog-type/5");
    expect(result).toEqual({ status: 204 });
  });
});
