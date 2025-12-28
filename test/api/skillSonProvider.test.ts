import { describe, it, expect, vi, beforeEach } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";
import type { SkillSonPayload } from "../../src/interfaces/skill-son/SkillSonPayload";
import type { SkillSonResponse } from "../../src/interfaces/skill-son/SkillSonResponse";

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

describe("skillSonProvider", () => {
  beforeEach(() => {
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.put.mockReset();
    axiosMock.delete.mockReset();
  });

  it("fetches skill sons and returns data", async () => {
    const skillSons: SkillSonResponse[] = [
      { id: 1, name: "React", nameEng: "React EN" },
    ];
    axiosMock.get.mockResolvedValueOnce({ data: skillSons });

    const { getSkillSons } = await import("../../src/api/skillSonProvider");
    const result = await getSkillSons();

    expect(axiosMock.get).toHaveBeenCalledWith("/skill-son");
    expect(result).toEqual(skillSons);
  });

  it("fetches a skill son by id", async () => {
    const skillSon: SkillSonResponse = {
      id: 3,
      name: "Node",
      nameEng: "Node EN",
    };
    axiosMock.get.mockResolvedValueOnce({ data: skillSon });

    const { getSkillSon } = await import("../../src/api/skillSonProvider");
    const result = await getSkillSon(3);

    expect(axiosMock.get).toHaveBeenCalledWith("/skill-son/3");
    expect(result).toEqual(skillSon);
  });

  it("creates a skill son and returns status", async () => {
    const payload: SkillSonPayload = { name: "React", nameEng: "React EN" };
    axiosMock.post.mockResolvedValueOnce({ status: 201 });

    const { createSkillSon } = await import("../../src/api/skillSonProvider");
    const result = await createSkillSon(payload);

    expect(axiosMock.post).toHaveBeenCalledWith("/skill-son", payload);
    expect(result).toEqual({ status: 201 });
  });

  it("updates a skill son and returns status", async () => {
    const payload: SkillSonPayload = { name: "Node", nameEng: "Node EN" };
    axiosMock.put.mockResolvedValueOnce({ status: 204 });

    const { updateSkillSon } = await import("../../src/api/skillSonProvider");
    const result = await updateSkillSon(7, payload);

    expect(axiosMock.put).toHaveBeenCalledWith("/skill-son/7", payload);
    expect(result).toEqual({ status: 204 });
  });

  it("deletes a skill son and returns status", async () => {
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const { deleteSkillSon } = await import("../../src/api/skillSonProvider");
    const result = await deleteSkillSon(9);

    expect(axiosMock.delete).toHaveBeenCalledWith("/skill-son/9");
    expect(result).toEqual({ status: 204 });
  });
});
