import { axiosClient } from "./axiosClient";
import type { HomeResponse } from "../interfaces/home/HomeResponse";
import type { HomeUpdatePayload } from "../interfaces/home/HomeUpdatePayload";

export type { HomeResponse, HomeUpdatePayload };

const HOME_ENDPOINT = "/home";

export const getHome = async (id: number): Promise<HomeResponse> => {
  const { data } = await axiosClient.get<HomeResponse>(
    `${HOME_ENDPOINT}/${id}`,
    {
      headers: {
        "x-skip-error-redirect": "true",
      },
    },
  );
  return data;
};

interface HomeUpdateResult {
  status: number;
}

export type { HomeUpdateResult };

export const updateHome = async (
  id: number,
  payload: HomeUpdatePayload,
): Promise<HomeUpdateResult> => {
  const response = await axiosClient.put(`${HOME_ENDPOINT}/${id}`, payload, {
    headers: {
      "x-skip-error-redirect": "true",
    },
  });
  return {
    status: response.status,
  };
};
