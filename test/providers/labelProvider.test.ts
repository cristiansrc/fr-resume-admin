import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

vi.mock("axios");

let axiosMock = axios as unknown as {
  get: vi.Mock;
  post: vi.Mock;
  delete: vi.Mock;
};

const labelMock = {
  id: 1,
  name: "Etiqueta",
  nameEng: "Label",
};

describe("labelProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv("VITE_API_URL", "https://api.test");
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.delete.mockReset();
  });

  const setupProvider = async (token?: string) => {
    if (token) {
      localStorage.setItem("refine-auth", token);
    }
    return import("../../src/providers/labelProvider");
  };

  const setupProviderWithReset = async (token?: string) => {
    if (token) {
      localStorage.setItem("refine-auth", token);
    }
    await vi.resetModules();
    vi.mock("axios");
    const axiosModule = (await import("axios")).default as unknown as {
      get: vi.Mock;
      post: vi.Mock;
      delete: vi.Mock;
    };
    axiosMock = axiosModule;
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.delete.mockReset();
    return import("../../src/providers/labelProvider");
  };

  it("fetches labels with authorization header", async () => {
    const { getLabels } = await setupProvider("token");
    axiosMock.get.mockResolvedValueOnce({
      data: [labelMock],
    });

    const result = await getLabels();

    expect(result).toEqual([labelMock]);
    expect(axiosMock.get).toHaveBeenCalledWith("https://api.test/label", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });
  });

  it("creates a label and returns the response status", async () => {
    const payload = { name: "Nuevo", nameEng: "New" };
    const { createLabel } = await setupProvider("token");
    axiosMock.post.mockResolvedValueOnce({
      data: labelMock,
      status: 201,
    });

    const result = await createLabel(payload);

    expect(result).toEqual({
      data: labelMock,
      status: 201,
    });
    expect(axiosMock.post).toHaveBeenCalledWith(
      "https://api.test/label",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    );
  });

  it("deletes a label using the provided id", async () => {
    const { deleteLabel } = await setupProvider("token");
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const result = await deleteLabel(4200);

    expect(result).toEqual({ status: 204 });
    expect(axiosMock.delete).toHaveBeenCalledWith(
      "https://api.test/label/4200",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    );
  });

  it("uses base headers when no token is present", async () => {
    const { getLabels, createLabel, deleteLabel } = await setupProvider();
    axiosMock.get.mockResolvedValueOnce({
      data: [labelMock],
    });
    axiosMock.post.mockResolvedValueOnce({
      data: labelMock,
      status: 201,
    });
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    await getLabels();
    await createLabel({ name: "Prueba", nameEng: "Test" });
    await deleteLabel(1);

    expect(axiosMock.get).toHaveBeenCalledWith("https://api.test/label", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(axiosMock.post).toHaveBeenCalledWith(
      "https://api.test/label",
      expect.any(Object),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(axiosMock.delete).toHaveBeenCalledWith(
      "https://api.test/label/1",
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  });

  it("falls back to the relative endpoint when the API URL is missing", async () => {
    vi.stubEnv("VITE_API_URL");
    const { getLabels } = await setupProviderWithReset("token");

    axiosMock.get.mockResolvedValueOnce({
      data: [labelMock],
    });

    await getLabels();

    expect(axiosMock.get).toHaveBeenCalledWith("/label", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });
  });
});
