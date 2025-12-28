import { axiosClient } from "./axiosClient";
import type { SkillTypePayload } from "../interfaces/skill-type/SkillTypePayload";
import type { SkillTypeResponse } from "../interfaces/skill-type/SkillTypeResponse";

export type { SkillTypePayload, SkillTypeResponse };

const SKILL_TYPE_ENDPOINT = "/skill-type";

export const getSkillTypes = async (): Promise<SkillTypeResponse[]> => {
  const { data } = await axiosClient.get<SkillTypeResponse[]>(
    SKILL_TYPE_ENDPOINT,
  );
  return data;
};

export const getSkillType = async (id: number): Promise<SkillTypeResponse> => {
  const { data } = await axiosClient.get<SkillTypeResponse>(
    `${SKILL_TYPE_ENDPOINT}/${id}`,
  );
  return data;
};

interface SkillTypeCreateResult {
  status: number;
}

interface SkillTypeUpdateResult {
  status: number;
}

interface SkillTypeDeleteResult {
  status: number;
}

export type {
  SkillTypeCreateResult,
  SkillTypeUpdateResult,
  SkillTypeDeleteResult,
};

export const createSkillType = async (
  payload: SkillTypePayload,
): Promise<SkillTypeCreateResult> => {
  const response = await axiosClient.post(SKILL_TYPE_ENDPOINT, payload);
  return { status: response.status };
};

export const updateSkillType = async (
  id: number,
  payload: SkillTypePayload,
): Promise<SkillTypeUpdateResult> => {
  const response = await axiosClient.put(`${SKILL_TYPE_ENDPOINT}/${id}`, payload);
  return { status: response.status };
};

export const deleteSkillType = async (
  id: number,
): Promise<SkillTypeDeleteResult> => {
  const response = await axiosClient.delete(`${SKILL_TYPE_ENDPOINT}/${id}`);
  return { status: response.status };
};
