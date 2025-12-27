import { axiosClient } from "./axiosClient";
import type { SkillPayload } from "../interfaces/skill/SkillPayload";
import type { SkillResponse } from "../interfaces/skill/SkillResponse";

export type { SkillPayload, SkillResponse };

const SKILL_ENDPOINT = "/skill";

export const getSkills = async (): Promise<SkillResponse[]> => {
  const { data } = await axiosClient.get<SkillResponse[]>(SKILL_ENDPOINT);
  return data;
};

export const getSkill = async (id: number): Promise<SkillResponse> => {
  const { data } = await axiosClient.get<SkillResponse>(
    `${SKILL_ENDPOINT}/${id}`,
  );
  return data;
};

interface SkillCreateResult {
  status: number;
}

interface SkillUpdateResult {
  status: number;
}

interface SkillDeleteResult {
  status: number;
}

export type { SkillCreateResult, SkillUpdateResult, SkillDeleteResult };

export const createSkill = async (
  payload: SkillPayload,
): Promise<SkillCreateResult> => {
  const response = await axiosClient.post(SKILL_ENDPOINT, payload);
  return { status: response.status };
};

export const updateSkill = async (
  id: number,
  payload: SkillPayload,
): Promise<SkillUpdateResult> => {
  const response = await axiosClient.put(`${SKILL_ENDPOINT}/${id}`, payload);
  return { status: response.status };
};

export const deleteSkill = async (id: number): Promise<SkillDeleteResult> => {
  const response = await axiosClient.delete(`${SKILL_ENDPOINT}/${id}`);
  return { status: response.status };
};
