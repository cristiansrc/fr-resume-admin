import { describe, expect, it, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";

vi.mock("../../src/api/axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const axiosMock = axiosClient as unknown as {
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
  wrapper: ["Reconocimiento 1", "Reconocimiento 2"],
  wrapperEng: ["Recognition 1", "Recognition 2"],
  descriptionPdf: ["Descripción PDF 1", "Descripción PDF 2"],
  descriptionPdfEng: ["PDF Description 1", "PDF Description 2"],
};

describe("basicDataProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    axiosMock.get.mockReset();
    axiosMock.put.mockReset();
  });

  const setupProvider = async () => import("../../src/api/basicDataProvider");

  it("fetches basic data", async () => {
    const { getBasicData } = await setupProvider();
    axiosMock.get.mockResolvedValueOnce({
      data: basicDataMock,
    });

    const result = await getBasicData();

    expect(result).toEqual(basicDataMock);
    expect(axiosMock.get).toHaveBeenCalledWith("/basic-data/1");
  });

  it("updates basic data and returns the status", async () => {
    const { updateBasicData } = await setupProvider();
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
    expect(axiosMock.put).toHaveBeenCalledWith("/basic-data/1", payload);
  });

  it("uses the base endpoint when loading without a token", async () => {
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
      wrapper: basicDataMock.wrapper,
      wrapperEng: basicDataMock.wrapperEng,
      descriptionPdf: basicDataMock.descriptionPdf,
      descriptionPdfEng: basicDataMock.descriptionPdfEng,
    });

    expect(axiosMock.get).toHaveBeenCalledWith("/basic-data/1");
    expect(axiosMock.put).toHaveBeenCalledWith("/basic-data/1", expect.any(Object));
  });
});
