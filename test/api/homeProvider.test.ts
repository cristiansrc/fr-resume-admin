import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { HomeResponse } from "../../src/interfaces/home/HomeResponse";
import type { HomeUpdatePayload } from "../../src/interfaces/home/HomeUpdatePayload";

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

describe("homeProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.put.mockReset();
  });

  it("fetches home data with skip redirect header", async () => {
    const response: HomeResponse = {
      id: 1,
      greeting: "Hola",
      greetingEng: "Hello",
      buttonWorkLabel: "Trabajo",
      buttonWorkLabelEng: "Work",
      buttonContactLabel: "Contacto",
      buttonContactLabelEng: "Contact",
      imageUrl: { id: 1, name: "Img", nameEng: "Img EN", url: "https://img" },
      labels: [{ id: 1, name: "Label", nameEng: "Label EN" }],
    };
    axiosMock.get.mockResolvedValueOnce({ data: response });

    const { getHome } = await import("../../src/api/homeProvider");
    const result = await getHome(1);

    expect(axiosMock.get).toHaveBeenCalledWith("/home/1", {
      headers: { "x-skip-error-redirect": "true" },
    });
    expect(result).toEqual(response);
  });

  it("updates home data with skip redirect header and returns status", async () => {
    const payload: HomeUpdatePayload = {
      greeting: "Hola",
      greetingEng: "Hello",
      buttonWorkLabel: "Trabajo",
      buttonWorkLabelEng: "Work",
      buttonContactLabel: "Contacto",
      buttonContactLabelEng: "Contact",
      imageUrlId: 1,
      labelIds: [1],
    };
    axiosMock.put.mockResolvedValueOnce({ status: 204 });

    const { updateHome } = await import("../../src/api/homeProvider");
    const result = await updateHome(2, payload);

    expect(axiosMock.put).toHaveBeenCalledWith("/home/2", payload, {
      headers: { "x-skip-error-redirect": "true" },
    });
    expect(result).toEqual({ status: 204 });
  });
});
