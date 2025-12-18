import axios from "axios";
import { LABEL_RESOURCE } from "../config/label-config";
import { TOKEN_KEY } from "./authProvider";
import type { LabelPayload } from "../interfaces/label/LabelPayload";
import type { LabelResponse } from "../interfaces/label/LabelResponse";

export type { LabelPayload, LabelResponse };

const API_URL = import.meta.env.VITE_API_URL ?? "";
const LABEL_ENDPOINT = `${API_URL}/${LABEL_RESOURCE}`;

const getRequestHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getLabels = async (): Promise<LabelResponse[]> => {
  const { data } = await axios.get<LabelResponse[]>(LABEL_ENDPOINT, {
    headers: getRequestHeaders(),
  });
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
  const response = await axios.post<LabelResponse>(LABEL_ENDPOINT, payload, {
    headers: getRequestHeaders(),
  });
  return {
    data: response.data,
    status: response.status,
  };
};

export const deleteLabel = async (id: number): Promise<LabelDeleteResult> => {
  const response = await axios.delete(`${LABEL_ENDPOINT}/${id}`, {
    headers: getRequestHeaders(),
  });
  return {
    status: response.status,
  };
};
