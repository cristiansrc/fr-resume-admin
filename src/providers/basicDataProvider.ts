import axios from "axios";
import {
  BASIC_DATA_RECORD_ID,
  BASIC_DATA_RESOURCE,
} from "../config/basic-data-config";
import { TOKEN_KEY } from "./authProvider";
import type { BasicDataPayload } from "../interfaces/basic-data/BasicDataPayload";
import type { BasicDataResponse } from "../interfaces/basic-data/BasicDataResponse";

export type { BasicDataPayload, BasicDataResponse };

const API_URL = import.meta.env.VITE_API_URL ?? "";
const BASIC_DATA_ENDPOINT = `${API_URL}/${BASIC_DATA_RESOURCE}/${BASIC_DATA_RECORD_ID}`;

const getRequestHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getBasicData = async (): Promise<BasicDataResponse> => {
  const { data } = await axios.get<BasicDataResponse>(BASIC_DATA_ENDPOINT, {
    headers: getRequestHeaders(),
  });
  return data;
};

interface BasicDataUpdateResult {
  data: BasicDataResponse;
  status: number;
}

export type { BasicDataUpdateResult };

export const updateBasicData = async (
  payload: BasicDataPayload,
): Promise<BasicDataUpdateResult> => {
  const response = await axios.put<BasicDataResponse>(
    BASIC_DATA_ENDPOINT,
    payload,
    {
      headers: getRequestHeaders(),
    },
  );
  return {
    data: response.data,
    status: response.status,
  };
};
