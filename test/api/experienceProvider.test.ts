import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { ExperiencePayload } from "../../src/interfaces/experience/ExperiencePayload";
import type { ExperienceResponse } from "../../src/interfaces/experience/ExperienceResponse";

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

describe("experienceProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.put.mockReset();
    axiosMock.delete.mockReset();
  });

  it("fetches experiences and returns data", async () => {
    const experiences: ExperienceResponse[] = [
      {
        id: 1,
        yearStart: "2020-01-01",
        yearEnd: "2021-01-01",
        company: "Acme",
        description: "Desc",
        descriptionEng: "Desc EN",
        skillSons: [{ id: 1, name: "Skill", nameEng: "Skill EN" }],
      },
    ];
    axiosMock.get.mockResolvedValueOnce({ data: experiences });

    const { getExperiences } = await import("../../src/api/experienceProvider");
    const result = await getExperiences();

    expect(axiosMock.get).toHaveBeenCalledWith("/experience");
    expect(result).toEqual(experiences);
  });

  it("fetches a single experience by id", async () => {
    const experience: ExperienceResponse = {
      id: 2,
      yearStart: "2021-01-01",
      yearEnd: "2022-01-01",
      company: "Beta",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSons: [{ id: 2, name: "Skill", nameEng: "Skill EN" }],
    };
    axiosMock.get.mockResolvedValueOnce({ data: experience });

    const { getExperience } = await import("../../src/api/experienceProvider");
    const result = await getExperience(2);

    expect(axiosMock.get).toHaveBeenCalledWith("/experience/2");
    expect(result).toEqual(experience);
  });

  it("creates an experience and returns status", async () => {
    const payload: ExperiencePayload = {
      yearStart: "2020-01-01",
      yearEnd: "2021-01-01",
      company: "Acme",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSonIds: [1, 2],
    };
    axiosMock.post.mockResolvedValueOnce({ status: 201 });

    const { createExperience } = await import("../../src/api/experienceProvider");
    const result = await createExperience(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/experience", payload);
    expect(result).toEqual({ status: 201 });
  });

  it("updates an experience and returns status", async () => {
    const payload: ExperiencePayload = {
      yearStart: "2020-01-01",
      yearEnd: "2021-01-01",
      company: "Acme",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSonIds: [1],
    };
    axiosMock.put.mockResolvedValueOnce({ status: 204 });

    const { updateExperience } = await import("../../src/api/experienceProvider");
    const result = await updateExperience(7, payload);

    expect(axiosMock.put).toHaveBeenCalledWith("/experience/7", payload);
    expect(result).toEqual({ status: 204 });
  });

  it("deletes an experience and returns status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteExperience } = await import("../../src/api/experienceProvider");
    const result = await deleteExperience(9);

    expect(axiosMock.delete).toHaveBeenCalledWith("/experience/9");
    expect(result).toEqual({ status: 204 });
  });
});
