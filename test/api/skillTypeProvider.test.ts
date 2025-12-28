import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { SkillTypePayload } from "../../src/interfaces/skill-type/SkillTypePayload";
import type { SkillTypeResponse } from "../../src/interfaces/skill-type/SkillTypeResponse";

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

describe("skillTypeProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.put.mockReset();
    axiosMock.delete.mockReset();
  });

  it("fetches skill types and returns data", async () => {
    const skillTypes: SkillTypeResponse[] = [
      { id: 1, name: "Frontend", nameEng: "Frontend EN" },
    ];
    axiosMock.get.mockResolvedValueOnce({ data: skillTypes });

    const { getSkillTypes } = await import("../../src/api/skillTypeProvider");
    const result = await getSkillTypes();

    expect(axiosMock.get).toHaveBeenCalledWith("/skill-type");
    expect(result).toEqual(skillTypes);
  });

  it("fetches a skill type by id", async () => {
    const skillType: SkillTypeResponse = {
      id: 3,
      name: "Backend",
      nameEng: "Backend EN",
    };
    axiosMock.get.mockResolvedValueOnce({ data: skillType });

    const { getSkillType } = await import("../../src/api/skillTypeProvider");
    const result = await getSkillType(3);

    expect(axiosMock.get).toHaveBeenCalledWith("/skill-type/3");
    expect(result).toEqual(skillType);
  });

  it("creates a skill type and returns status", async () => {
    const payload: SkillTypePayload = {
      name: "Frontend",
      nameEng: "Frontend EN",
      skillIds: [1, 2],
    };
    axiosMock.post.mockResolvedValueOnce({ status: 201 });

    const { createSkillType } = await import("../../src/api/skillTypeProvider");
    const result = await createSkillType(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/skill-type", payload);
    expect(result).toEqual({ status: 201 });
  });

  it("updates a skill type and returns status", async () => {
    const payload: SkillTypePayload = {
      name: "Backend",
      nameEng: "Backend EN",
      skillIds: [3],
    };
    axiosMock.put.mockResolvedValueOnce({ status: 204 });

    const { updateSkillType } = await import("../../src/api/skillTypeProvider");
    const result = await updateSkillType(7, payload);

    expect(axiosMock.put).toHaveBeenCalledWith("/skill-type/7", payload);
    expect(result).toEqual({ status: 204 });
  });

  it("deletes a skill type and returns status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteSkillType } = await import("../../src/api/skillTypeProvider");
    const result = await deleteSkillType(9);

    expect(axiosMock.delete).toHaveBeenCalledWith("/skill-type/9");
    expect(result).toEqual({ status: 204 });
  });
});
