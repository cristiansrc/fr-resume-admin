import { describe, it, expect, vi } from "vitest";

const loadConfig = async (value?: string) => {
  vi.resetModules();
  if (typeof value === "string") {
    vi.stubEnv("VITE_API_URL", value);
  } else {
    vi.stubEnv("VITE_API_URL");
  }
  return import("../../src/api/apiConfig");
};

describe("apiConfig", () => {
  it("returns the configured API url", async () => {
    const { API_URL } = await loadConfig("https://api.example");
    expect(API_URL).toBe("https://api.example");
  });

  it("falls back to an empty string when the env is missing", async () => {
    const { API_URL } = await loadConfig();
    expect(API_URL).toBe("");
  });
});
