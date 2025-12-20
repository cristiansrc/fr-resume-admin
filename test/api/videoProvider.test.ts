import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { VideoPayload } from "../../src/interfaces/video/VideoPayload";

vi.mock("../../src/api/axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const axiosMock = axiosClient as unknown as {
  get: vi.Mock;
  post: vi.Mock;
  delete: vi.Mock;
};

describe("videoProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.delete.mockReset();
  });

  it("fetches videos and returns data", async () => {
    const videos = [
      { id: 1, name: "Video", nameEng: "Video", url: "https://youtube.com" },
    ];
    axiosMock.get.mockResolvedValueOnce({ data: videos });

    const { getVideos } = await import("../../src/api/videoProvider");
    const result = await getVideos();

    expect(axiosMock.get).toHaveBeenCalledWith("/video-url");
    expect(result).toEqual(videos);
  });

  it("creates a video and returns data + status", async () => {
    const payload: VideoPayload = {
      name: "Video",
      nameEng: "Video",
      url: "https://youtube.com/watch?v=12345678901",
    };
    const responseData = { id: 2, ...payload };

    axiosMock.post.mockResolvedValueOnce({ data: responseData, status: 201 });

    const { createVideo } = await import("../../src/api/videoProvider");
    const result = await createVideo(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/video-url", payload);
    expect(result).toEqual({ data: responseData, status: 201 });
  });

  it("deletes a video by id and returns status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteVideo } = await import("../../src/api/videoProvider");
    const result = await deleteVideo(7);

    expect(axiosMock.delete).toHaveBeenCalledWith("/video-url/7");
    expect(result).toEqual({ status: 204 });
  });
});
