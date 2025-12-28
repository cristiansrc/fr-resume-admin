import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { SkillPayload } from "../../src/interfaces/skill/SkillPayload";
import type { SkillResponse } from "../../src/interfaces/skill/SkillResponse";

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

describe("skillProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.put.mockReset();
    axiosMock.delete.mockReset();
  });

  it("fetches skills and returns data", async () => {
    const skills: SkillResponse[] = [
      {
        id: 1,
        name: "Frontend",
        nameEng: "Frontend EN",
        skillSons: [{ id: 2, name: "React", nameEng: "React EN" }],
      },
    ];
    axiosMock.get.mockResolvedValueOnce({ data: skills });

    const { getSkills } = await import("../../src/api/skillProvider");
    const result = await getSkills();

    expect(axiosMock.get).toHaveBeenCalledWith("/skill");
    expect(result).toEqual(skills);
  });

  it("fetches a skill by id", async () => {
    const skill: SkillResponse = {
      id: 3,
      name: "Backend",
      nameEng: "Backend EN",
      skillSons: [{ id: 4, name: "Node", nameEng: "Node EN" }],
    };
    axiosMock.get.mockResolvedValueOnce({ data: skill });

    const { getSkill } = await import("../../src/api/skillProvider");
    const result = await getSkill(3);

    expect(axiosMock.get).toHaveBeenCalledWith("/skill/3");
    expect(result).toEqual(skill);
  });

  it("creates a skill and returns status", async () => {
    const payload: SkillPayload = {
      name: "Frontend",
      nameEng: "Frontend EN",
      skillSonIds: [1, 2],
    };
    axiosMock.post.mockResolvedValueOnce({ status: 201 });

    const { createSkill } = await import("../../src/api/skillProvider");
    const result = await createSkill(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/skill", payload);
    expect(result).toEqual({ status: 201 });
  });

  it("updates a skill and returns status", async () => {
    const payload: SkillPayload = {
      name: "Backend",
      nameEng: "Backend EN",
      skillSonIds: [3],
    };
    axiosMock.put.mockResolvedValueOnce({ status: 204 });

    const { updateSkill } = await import("../../src/api/skillProvider");
    const result = await updateSkill(7, payload);

    expect(axiosMock.put).toHaveBeenCalledWith("/skill/7", payload);
    expect(result).toEqual({ status: 204 });
  });

  it("deletes a skill and returns status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteSkill } = await import("../../src/api/skillProvider");
    const result = await deleteSkill(9);

    expect(axiosMock.delete).toHaveBeenCalledWith("/skill/9");
    expect(result).toEqual({ status: 204 });
  });
});
