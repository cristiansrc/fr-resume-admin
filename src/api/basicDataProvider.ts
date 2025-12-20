import {
  BASIC_DATA_RECORD_ID,
  BASIC_DATA_RESOURCE,
} from "../config/basic-data-config";
import { axiosClient } from "./axiosClient";
import type { BasicDataPayload } from "../interfaces/basic-data/BasicDataPayload";
import type { BasicDataResponse } from "../interfaces/basic-data/BasicDataResponse";

export type { BasicDataPayload, BasicDataResponse };

const BASIC_DATA_ENDPOINT = `/${BASIC_DATA_RESOURCE}/${BASIC_DATA_RECORD_ID}`;

export const getBasicData = async (): Promise<BasicDataResponse> => {
  const { data } = await axiosClient.get<BasicDataResponse>(BASIC_DATA_ENDPOINT);
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
  const response = await axiosClient.put<BasicDataResponse>(
    BASIC_DATA_ENDPOINT,
    payload,
  );
  return {
    data: response.data,
    status: response.status,
  };
};
