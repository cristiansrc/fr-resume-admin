import { axiosClient } from "./axiosClient";
import type { SkillSonPayload } from "../interfaces/skill-son/SkillSonPayload";
import type { SkillSonResponse } from "../interfaces/skill-son/SkillSonResponse";

export type { SkillSonPayload, SkillSonResponse };

const SKILL_SON_ENDPOINT = "/skill-son";

export const getSkillSons = async (): Promise<SkillSonResponse[]> => {
  const { data } = await axiosClient.get<SkillSonResponse[]>(SKILL_SON_ENDPOINT);
  return data;
};

export const getSkillSon = async (id: number): Promise<SkillSonResponse> => {
  const { data } = await axiosClient.get<SkillSonResponse>(
    `${SKILL_SON_ENDPOINT}/${id}`,
  );
  return data;
};

interface SkillSonCreateResult {
  status: number;
}

interface SkillSonUpdateResult {
  status: number;
}

interface SkillSonDeleteResult {
  status: number;
}

export type { SkillSonCreateResult, SkillSonUpdateResult, SkillSonDeleteResult };

export const createSkillSon = async (
  payload: SkillSonPayload,
): Promise<SkillSonCreateResult> => {
  const response = await axiosClient.post(SKILL_SON_ENDPOINT, payload);
  return { status: response.status };
};

export const updateSkillSon = async (
  id: number,
  payload: SkillSonPayload,
): Promise<SkillSonUpdateResult> => {
  const response = await axiosClient.put(`${SKILL_SON_ENDPOINT}/${id}`, payload);
  return { status: response.status };
};

export const deleteSkillSon = async (
  id: number,
): Promise<SkillSonDeleteResult> => {
  const response = await axiosClient.delete(`${SKILL_SON_ENDPOINT}/${id}`);
  return { status: response.status };
};
