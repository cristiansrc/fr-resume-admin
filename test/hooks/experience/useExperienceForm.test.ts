import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import * as api from "../../../src/api";
import { BASIC_DATA_DATE_FORMAT } from "../../../src/config/basic-data-config";
import { useExperienceForm } from "../../../src/hooks/experience/useExperienceForm";

const { notifySuccess, notifyError, setFieldsValue } = vi.hoisted(() => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
  setFieldsValue: vi.fn(),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    Form: {
      ...actual.Form,
      useForm: () => [{ setFieldsValue }],
    },
  };
});

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useExperienceForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads an experience when editing", async () => {
    (api.getExperience as unknown as vi.Mock).mockResolvedValue({
      yearStart: "2022-01-01",
      yearEnd: "2023-01-01",
      company: "Company",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSons: [{ id: 1, name: "Skill" }],
    });

    const { result } = renderHook(() =>
      useExperienceForm({ mode: "edit", experienceId: 1 }),
    );

    await waitFor(() => expect(api.getExperience).toHaveBeenCalledWith(1));
    expect(setFieldsValue).toHaveBeenCalledWith({
      yearStart: dayjs("2022-01-01"),
      yearEnd: dayjs("2023-01-01"),
      company: "Company",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSonIds: [1],
    });
    await waitFor(() =>
      expect(result.current.selectedSkillSons).toEqual([
        { id: 1, name: "Skill" },
      ]),
    );
  });

  it("notifies when experience fails to load", async () => {
    (api.getExperience as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useExperienceForm({ mode: "edit", experienceId: 3 }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la experiencia",
        }),
      ),
    );
  });

  it("updates selected skill sons", () => {
    const { result } = renderHook(() =>
      useExperienceForm({ mode: "create" }),
    );

    act(() => {
      result.current.handleSkillSonsSelect([2], [{ id: 2, name: "Skill" }]);
    });

    expect(setFieldsValue).toHaveBeenCalledWith({ skillSonIds: [2] });
    expect(result.current.selectedSkillSons).toEqual([{ id: 2, name: "Skill" }]);
  });

  it("creates an experience with formatted dates", async () => {
    (api.createExperience as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useExperienceForm({ mode: "create" }),
    );

    const yearStart = dayjs("2020-01-01");
    const yearEnd = dayjs("2021-01-01");

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        yearStart,
        yearEnd,
        company: "Company",
        description: "Desc",
        descriptionEng: "Desc EN",
        skillSonIds: [1],
      });
    });

    expect(api.createExperience).toHaveBeenCalledWith({
      yearStart: yearStart.format(BASIC_DATA_DATE_FORMAT),
      yearEnd: yearEnd.format(BASIC_DATA_DATE_FORMAT),
      company: "Company",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSonIds: [1],
    });
    expect(success).toBe(true);
  });

  it("calls onSuccess when updating", async () => {
    const onSuccess = vi.fn();
    (api.updateExperience as unknown as vi.Mock).mockResolvedValue({ status: 200 });

    const { result } = renderHook(() =>
      useExperienceForm({ mode: "edit", experienceId: 5, onSuccess }),
    );

    const success = await result.current.handleSubmit({
      yearStart: undefined,
      yearEnd: undefined,
      company: "Company",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSonIds: [],
    });

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith("Experiencia actualizada"),
    );
    expect(success).toBe(true);
  });

  it("notifies success when creating without onSuccess", async () => {
    (api.createExperience as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useExperienceForm({ mode: "create" }),
    );

    const yearStart = dayjs("2020-01-01");

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        yearStart,
        yearEnd: undefined,
        company: "Company",
        description: "Desc",
        descriptionEng: "Desc EN",
        skillSonIds: [],
      });
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Experiencia creada" }),
    );
    expect(success).toBe(true);
  });

  it("notifies when submit fails", async () => {
    (api.updateExperience as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() =>
      useExperienceForm({ mode: "edit", experienceId: 9 }),
    );

    const success = await result.current.handleSubmit({
      yearStart: undefined,
      yearEnd: undefined,
      company: "Company",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSonIds: [],
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo actualizar la experiencia",
        }),
      ),
    );
    expect(success).toBe(false);
  });

  it("notifies when response status is unexpected", async () => {
    (api.updateExperience as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() =>
      useExperienceForm({ mode: "edit", experienceId: 9 }),
    );

    const success = await result.current.handleSubmit({
      yearStart: undefined,
      yearEnd: undefined,
      company: "Company",
      description: "Desc",
      descriptionEng: "Desc EN",
      skillSonIds: [],
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo actualizar la experiencia",
        }),
      ),
    );
    expect(success).toBe(false);
  });
});
