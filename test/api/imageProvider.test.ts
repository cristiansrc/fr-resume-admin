import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { ImagePayload } from "../../src/interfaces/image/ImagePayload";

vi.mock("../../src/api/axiosClient", () => ({
  axiosClient: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const axiosMock = axiosClient as unknown as {
  post: vi.Mock;
  delete: vi.Mock;
};

describe("imageProvider", () => {
  beforeEach(() => {
    axiosMock.post.mockReset();
    axiosMock.delete.mockReset();
  });

  it("creates an image and returns the status", async () => {
    const payload: ImagePayload = {
      name: "Imagen",
      nameEng: "Image",
      file: "base64-data",
    };

    axiosMock.post.mockResolvedValueOnce({ status: 201 });

    const { createImage } = await import("../../src/api/imageProvider");
    const result = await createImage(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/image-url", payload);
    expect(result).toEqual({ status: 201 });
  });

  it("deletes an image by id and returns the status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteImage } = await import("../../src/api/imageProvider");
    const result = await deleteImage(10);

    expect(axiosMock.delete).toHaveBeenCalledWith("/image-url/10");
    expect(result).toEqual({ status: 204 });
  });
});
