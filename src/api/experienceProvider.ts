import { axiosClient } from "./axiosClient";
import type { ExperiencePayload } from "../interfaces/experience/ExperiencePayload";
import type { ExperienceResponse } from "../interfaces/experience/ExperienceResponse";

export type { ExperiencePayload, ExperienceResponse };

const EXPERIENCE_ENDPOINT = "/experience";

export const getExperiences = async (): Promise<ExperienceResponse[]> => {
  const { data } = await axiosClient.get<ExperienceResponse[]>(
    EXPERIENCE_ENDPOINT,
  );
  return data;
};

export const getExperience = async (id: number): Promise<ExperienceResponse> => {
  const { data } = await axiosClient.get<ExperienceResponse>(
    `${EXPERIENCE_ENDPOINT}/${id}`,
  );
  return data;
};

interface ExperienceCreateResult {
  status: number;
}

interface ExperienceUpdateResult {
  status: number;
}

interface ExperienceDeleteResult {
  status: number;
}

export type {
  ExperienceCreateResult,
  ExperienceUpdateResult,
  ExperienceDeleteResult,
};

export const createExperience = async (
  payload: ExperiencePayload,
): Promise<ExperienceCreateResult> => {
  const response = await axiosClient.post(EXPERIENCE_ENDPOINT, payload);
  return { status: response.status };
};

export const updateExperience = async (
  id: number,
  payload: ExperiencePayload,
): Promise<ExperienceUpdateResult> => {
  const response = await axiosClient.put(`${EXPERIENCE_ENDPOINT}/${id}`, payload);
  return { status: response.status };
};

export const deleteExperience = async (
  id: number,
): Promise<ExperienceDeleteResult> => {
  const response = await axiosClient.delete(`${EXPERIENCE_ENDPOINT}/${id}`);
  return { status: response.status };
};
