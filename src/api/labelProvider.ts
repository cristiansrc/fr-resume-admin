import { LABEL_RESOURCE } from "../config/label-config";
import { axiosClient } from "./axiosClient";
import type { LabelPayload } from "../interfaces/label/LabelPayload";
import type { LabelResponse } from "../interfaces/label/LabelResponse";

export type { LabelPayload, LabelResponse };

const LABEL_ENDPOINT = `/${LABEL_RESOURCE}`;

export const getLabels = async (): Promise<LabelResponse[]> => {
  const { data } = await axiosClient.get<LabelResponse[]>(LABEL_ENDPOINT);
  return data;
};

interface LabelCreateResult {
  data: LabelResponse;
  status: number;
}

interface LabelDeleteResult {
  status: number;
}

export type { LabelCreateResult, LabelDeleteResult };

export const createLabel = async (
  payload: LabelPayload,
): Promise<LabelCreateResult> => {
  const response = await axiosClient.post<LabelResponse>(LABEL_ENDPOINT, payload);
  return {
    data: response.data,
    status: response.status,
  };
};

export const deleteLabel = async (id: number): Promise<LabelDeleteResult> => {
  const response = await axiosClient.delete(`${LABEL_ENDPOINT}/${id}`);
  return {
    status: response.status,
  };
};
