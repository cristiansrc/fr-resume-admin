import { axiosClient } from "./axiosClient";
import type { EducationPayload } from "../interfaces/education/EducationPayload";
import type { EducationResponse } from "../interfaces/education/EducationResponse";

export type { EducationPayload, EducationResponse };

const EDUCATION_ENDPOINT = "/education";

export const getEducations = async (): Promise<EducationResponse[]> => {
  const { data } = await axiosClient.get<EducationResponse[]>(EDUCATION_ENDPOINT);
  return data;
};

export const getEducation = async (id: number): Promise<EducationResponse> => {
  const { data } = await axiosClient.get<EducationResponse>(
    `${EDUCATION_ENDPOINT}/${id}`,
  );
  return data;
};

interface EducationCreateResult {
  status: number;
}

interface EducationUpdateResult {
  status: number;
}

interface EducationDeleteResult {
  status: number;
}

export type {
  EducationCreateResult,
  EducationUpdateResult,
  EducationDeleteResult,
};

export const createEducation = async (
  payload: EducationPayload,
): Promise<EducationCreateResult> => {
  const response = await axiosClient.post(EDUCATION_ENDPOINT, payload);
  return { status: response.status };
};

export const updateEducation = async (
  id: number,
  payload: EducationPayload,
): Promise<EducationUpdateResult> => {
  const response = await axiosClient.put(`${EDUCATION_ENDPOINT}/${id}`, payload);
  return { status: response.status };
};

export const deleteEducation = async (
  id: number,
): Promise<EducationDeleteResult> => {
  const response = await axiosClient.delete(`${EDUCATION_ENDPOINT}/${id}`);
  return { status: response.status };
};
