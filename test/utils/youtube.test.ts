import { describe, it, expect } from "vitest";
import {
  getYoutubePreviewUrl,
  getYoutubeVideoId,
  isYoutubeUrlValid,
} from "../../src/utils/youtube";

describe("youtube utils", () => {
  it("extracts the video id from common urls", () => {
    const videoId = "ABCDEFGHIJK";

    expect(
      getYoutubeVideoId(`https://www.youtube.com/watch?v=${videoId}`),
    ).toBe(videoId);
    expect(getYoutubeVideoId(`https://youtu.be/${videoId}`)).toBe(videoId);
    expect(getYoutubeVideoId(`https://www.youtube.com/embed/${videoId}`)).toBe(
      videoId,
    );
    expect(getYoutubeVideoId(`https://www.youtube.com/v/${videoId}`)).toBe(
      videoId,
    );
  });

  it("returns undefined for invalid urls", () => {
    expect(getYoutubeVideoId("https://example.com")).toBeUndefined();
  });

  it("builds the preview url when possible", () => {
    const videoId = "ABCDEFGHIJK";

    expect(
      getYoutubePreviewUrl(`https://www.youtube.com/watch?v=${videoId}`),
    ).toBe(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
  });

  it("validates youtube urls", () => {
    expect(isYoutubeUrlValid("https://youtu.be/ABCDEFGHIJK")).toBe(true);
    expect(isYoutubeUrlValid("")).toBe(false);
    expect(isYoutubeUrlValid()).toBe(false);
  });
});
