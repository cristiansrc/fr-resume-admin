import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSkillForm } from "../../../src/hooks/skill/useSkillForm";
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

describe("useSkillForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a skill when editing", async () => {
    (api.getSkill as unknown as vi.Mock).mockResolvedValue({
      name: "Skill",
      nameEng: "Skill EN",
      skillSons: [{ id: 1, name: "Child" }],
    });

    const { result } = renderHook(() =>
      useSkillForm({ mode: "edit", skillId: 1 }),
    );

    await waitFor(() => expect(api.getSkill).toHaveBeenCalledWith(1));
    expect(setFieldsValue).toHaveBeenCalledWith({
      name: "Skill",
      nameEng: "Skill EN",
      skillSonIds: [1],
    });
    await waitFor(() =>
      expect(result.current.selectedSkillSons).toEqual([
        { id: 1, name: "Child" },
      ]),
    );
  });

  it("notifies when skill fails to load", async () => {
    (api.getSkill as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useSkillForm({ mode: "edit", skillId: 2 }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la habilidad",
        }),
      ),
    );
  });

  it("updates skill sons selections", async () => {
    const { result } = renderHook(() =>
      useSkillForm({ mode: "create" }),
    );

    act(() => {
      result.current.handleSkillSonsSelect([2], [{ id: 2, name: "Child" }]);
    });

    expect(setFieldsValue).toHaveBeenCalledWith({ skillSonIds: [2] });
    expect(result.current.selectedSkillSons).toEqual([{ id: 2, name: "Child" }]);
  });

  it("creates a skill and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    (api.createSkill as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useSkillForm({ mode: "create", onSuccess }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Skill",
        nameEng: "Skill EN",
        skillSonIds: [1],
      });
    });

    expect(api.createSkill).toHaveBeenCalledWith({
      name: "Skill",
      nameEng: "Skill EN",
      skillSonIds: [1],
    });
    expect(onSuccess).toHaveBeenCalledWith("Habilidad creada");
    expect(success).toBe(true);
  });

  it("notifies success when creating without onSuccess", async () => {
    (api.createSkill as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useSkillForm({ mode: "create" }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Skill",
        nameEng: "Skill EN",
        skillSonIds: [1],
      });
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Habilidad creada" }),
    );
    expect(success).toBe(true);
  });

  it("notifies when submit fails", async () => {
    (api.createSkill as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() =>
      useSkillForm({ mode: "create" }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Skill",
        nameEng: "Skill EN",
        skillSonIds: [1],
      });
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo crear la habilidad",
      }),
    );
    expect(success).toBe(false);
  });

  it("notifies when update status is unexpected", async () => {
    (api.updateSkill as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() =>
      useSkillForm({ mode: "edit", skillId: 3 }),
    );

    const success = await result.current.handleSubmit({
      name: "Skill",
      nameEng: "Skill EN",
      skillSonIds: [1],
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo actualizar la habilidad",
        }),
      ),
    );
    expect(success).toBe(false);
  });
});
