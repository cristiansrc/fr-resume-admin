import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");

let axiosMock = axios as unknown as {
  get: vi.Mock;
  put: vi.Mock;
};

const basicDataMock = {
  id: "1",
  firstName: "Juan",
  othersName: "Carlos",
  firstSurName: "Reyes",
  othersSurName: "Martínez",
  dateBirth: "2000-01-01",
  located: "Bogotá",
  locatedEng: "Bogotá",
  startWorkingDate: "2020-01-02",
  greeting: "Hola",
  greetingEng: "Hello",
  email: "correo@example.com",
  instagram: "https://instagram.com/test",
  linkedin: "https://linkedin.com/in/test",
  x: "https://x.com/test",
  github: "https://github.com/test",
  description: "Descripción",
  descriptionEng: "Description",
};

describe("basicDataProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    axiosMock.get.mockReset();
    axiosMock.put.mockReset();
    vi.stubEnv("VITE_API_URL", "https://api.test");
  });

  const setupProvider = async (token?: string) => {
    if (token) {
      localStorage.setItem("refine-auth", token);
    }

    return import("../../src/providers/basicDataProvider");
  };

  const setupProviderWithReset = async (token?: string) => {
    if (token) {
      localStorage.setItem("refine-auth", token);
    }
    await vi.resetModules();
    vi.mock("axios");
    const axiosModule = (await import("axios")).default as unknown as {
      get: vi.Mock;
      put: vi.Mock;
    };
    axiosMock = axiosModule;
    axiosMock.get.mockReset();
    axiosMock.put.mockReset();
    return import("../../src/providers/basicDataProvider");
  };

  it("fetches basic data with auth headers", async () => {
    const { getBasicData } = await setupProvider("token");
    axiosMock.get.mockResolvedValueOnce({
      data: basicDataMock,
    });

    const result = await getBasicData();

    expect(result).toEqual(basicDataMock);
    expect(axiosMock.get).toHaveBeenCalledWith(
      "https://api.test/basic-data/1",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    );
  });

  it("updates basic data and returns the status", async () => {
    const { updateBasicData } = await setupProvider("token");
    const { id, ...payload } = basicDataMock;
    axiosMock.put.mockResolvedValueOnce({
      data: basicDataMock,
      status: 204,
    });

    const result = await updateBasicData(payload);

    expect(result).toEqual({
      data: basicDataMock,
      status: 204,
    });
    expect(axiosMock.put).toHaveBeenCalledWith(
      "https://api.test/basic-data/1",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      },
    );
  });

  it("uses default headers when no auth token exists", async () => {
    const { getBasicData, updateBasicData } = await setupProvider();

    axiosMock.get.mockResolvedValueOnce({
      data: basicDataMock,
    });
    axiosMock.put.mockResolvedValueOnce({
      data: basicDataMock,
      status: 200,
    });

    await getBasicData();
    await updateBasicData({
      firstName: basicDataMock.firstName,
      othersName: basicDataMock.othersName,
      firstSurName: basicDataMock.firstSurName,
      othersSurName: basicDataMock.othersSurName,
      dateBirth: basicDataMock.dateBirth ?? "",
      located: basicDataMock.located,
      locatedEng: basicDataMock.locatedEng,
      startWorkingDate: basicDataMock.startWorkingDate ?? "",
      greeting: basicDataMock.greeting,
      greetingEng: basicDataMock.greetingEng,
      email: basicDataMock.email,
      instagram: basicDataMock.instagram,
      linkedin: basicDataMock.linkedin,
      x: basicDataMock.x,
      github: basicDataMock.github,
      description: basicDataMock.description,
      descriptionEng: basicDataMock.descriptionEng,
    });

    expect(axiosMock.get).toHaveBeenCalledWith(
      "https://api.test/basic-data/1",
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    expect(axiosMock.put).toHaveBeenCalledWith(
      "https://api.test/basic-data/1",
      expect.any(Object),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  });

  it("falls back to relative endpoint when API url is missing", async () => {
    vi.stubEnv("VITE_API_URL");
    const { getBasicData } = await setupProviderWithReset("token");

    axiosMock.get.mockResolvedValueOnce({
      data: basicDataMock,
    });

    await getBasicData();

    expect(axiosMock.get).toHaveBeenCalledWith("/basic-data/1", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });
  });
});
