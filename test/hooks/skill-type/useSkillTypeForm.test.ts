import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSkillTypeForm } from "../../../src/hooks/skill-type/useSkillTypeForm";
import * as api from "../../../src/api";

const notifySuccess = vi.fn();
const notifyError = vi.fn();
const setFieldsValue = vi.fn();

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

describe("useSkillTypeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a skill type when editing", async () => {
    (api.getSkillType as unknown as vi.Mock).mockResolvedValue({
      name: "Frontend",
      nameEng: "Frontend",
      skills: [{ id: 2, name: "React" }],
    });

    const { result } = renderHook(() =>
      useSkillTypeForm({ mode: "edit", skillTypeId: 1 }),
    );

    await waitFor(() => expect(api.getSkillType).toHaveBeenCalledWith(1));
    expect(setFieldsValue).toHaveBeenCalledWith({
      name: "Frontend",
      nameEng: "Frontend",
      skillIds: [2],
    });
    await waitFor(() =>
      expect(result.current.selectedSkills).toEqual([
        { id: 2, name: "React" },
      ]),
    );
  });

  it("notifies when skill type fails to load", async () => {
    (api.getSkillType as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useSkillTypeForm({ mode: "edit", skillTypeId: 2 }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar el tipo de habilidad",
        }),
      ),
    );
  });

  it("updates selected skills", () => {
    const { result } = renderHook(() =>
      useSkillTypeForm({ mode: "create" }),
    );

    act(() => {
      result.current.handleSkillsSelect([5], [{ id: 5, name: "Node" }]);
    });

    expect(setFieldsValue).toHaveBeenCalledWith({ skillIds: [5] });
    expect(result.current.selectedSkills).toEqual([{ id: 5, name: "Node" }]);
  });

  it("creates a skill type and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    (api.createSkillType as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useSkillTypeForm({ mode: "create", onSuccess }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Backend",
        nameEng: "Backend",
        skillIds: [3],
      });
    });

    expect(api.createSkillType).toHaveBeenCalledWith({
      name: "Backend",
      nameEng: "Backend",
      skillIds: [3],
    });
    expect(onSuccess).toHaveBeenCalledWith("Tipo de habilidad creado");
    expect(success).toBe(true);
  });

  it("notifies success when creating without onSuccess", async () => {
    (api.createSkillType as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useSkillTypeForm({ mode: "create" }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Backend",
        nameEng: "Backend",
        skillIds: [3],
      });
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tipo de habilidad creado" }),
    );
    expect(success).toBe(true);
  });

  it("notifies when submit fails", async () => {
    (api.createSkillType as unknown as vi.Mock).mockRejectedValue(
      new Error("boom"),
    );

    const { result } = renderHook(() =>
      useSkillTypeForm({ mode: "create" }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Backend",
        nameEng: "Backend",
        skillIds: [3],
      });
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo crear el tipo de habilidad",
      }),
    );
    expect(success).toBe(false);
  });

  it("notifies when update status is unexpected", async () => {
    (api.updateSkillType as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() =>
      useSkillTypeForm({ mode: "edit", skillTypeId: 4 }),
    );

    const success = await result.current.handleSubmit({
      name: "Backend",
      nameEng: "Backend",
      skillIds: [3],
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo actualizar el tipo de habilidad",
        }),
      ),
    );
    expect(success).toBe(false);
  });
});
