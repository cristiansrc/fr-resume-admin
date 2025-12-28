import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSkillSonForm } from "../../../src/hooks/skill-son/useSkillSonForm";
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

describe("useSkillSonForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a skill son when editing", async () => {
    (api.getSkillSon as unknown as vi.Mock).mockResolvedValue({
      name: "Child",
      nameEng: "Child EN",
    });

    const { result } = renderHook(() =>
      useSkillSonForm({ mode: "edit", skillSonId: 1 }),
    );

    await waitFor(() => expect(api.getSkillSon).toHaveBeenCalledWith(1));
    expect(setFieldsValue).toHaveBeenCalledWith({
      name: "Child",
      nameEng: "Child EN",
    });
  });

  it("notifies when skill son fails to load", async () => {
    (api.getSkillSon as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useSkillSonForm({ mode: "edit", skillSonId: 2 }));

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la habilidad hija",
        }),
      ),
    );
  });

  it("creates a skill son and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    (api.createSkillSon as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useSkillSonForm({ mode: "create", onSuccess }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Child",
        nameEng: "Child EN",
      });
    });

    expect(api.createSkillSon).toHaveBeenCalledWith({
      name: "Child",
      nameEng: "Child EN",
    });
    expect(onSuccess).toHaveBeenCalledWith("Habilidad hija creada");
    expect(success).toBe(true);
  });

  it("notifies success when creating without onSuccess", async () => {
    (api.createSkillSon as unknown as vi.Mock).mockResolvedValue({ status: 201 });

    const { result } = renderHook(() =>
      useSkillSonForm({ mode: "create" }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Child",
        nameEng: "Child EN",
      });
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Habilidad hija creada" }),
    );
    expect(success).toBe(true);
  });

  it("notifies when submit fails", async () => {
    (api.createSkillSon as unknown as vi.Mock).mockRejectedValue(
      new Error("boom"),
    );

    const { result } = renderHook(() =>
      useSkillSonForm({ mode: "create" }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit({
        name: "Child",
        nameEng: "Child EN",
      });
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo crear la habilidad hija",
      }),
    );
    expect(success).toBe(false);
  });

  it("notifies when update status is unexpected", async () => {
    (api.updateSkillSon as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() =>
      useSkillSonForm({ mode: "edit", skillSonId: 3 }),
    );

    const success = await result.current.handleSubmit({
      name: "Child",
      nameEng: "Child EN",
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo actualizar la habilidad hija",
        }),
      ),
    );
    expect(success).toBe(false);
  });
});
