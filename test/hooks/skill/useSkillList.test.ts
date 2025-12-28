import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSkillList } from "../../../src/hooks/skill/useSkillList";
import * as api from "../../../src/api";

const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useSkillList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads skills and exposes the data", async () => {
    (api.getSkills as unknown as vi.Mock).mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useSkillList());

    await waitFor(() => expect(api.getSkills).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));
  });

  it("shows a success message on reload when pending message is set", async () => {
    (api.getSkills as unknown as vi.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useSkillList());

    await waitFor(() => expect(api.getSkills).toHaveBeenCalled());

    act(() => result.current.setSuccessOnReload("Actualizado"));
    await act(async () => {
      await result.current.reloadSkills();
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Actualizado" }),
    );
  });

  it("deletes a skill and reloads the list on success", async () => {
    (api.getSkills as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkill as unknown as vi.Mock).mockResolvedValue({ status: 204 });

    const { result } = renderHook(() => useSkillList());

    await waitFor(() => expect(api.getSkills).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(10);
    });

    expect(api.deleteSkill).toHaveBeenCalledWith(10);
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Habilidad eliminada" }),
    );
  });

  it("notifies when delete fails", async () => {
    (api.getSkills as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkill as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useSkillList());

    await waitFor(() => expect(api.getSkills).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(3);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar la habilidad",
      }),
    );
  });

  it("notifies when load fails", async () => {
    (api.getSkills as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useSkillList());

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la lista de habilidades",
        }),
      ),
    );
  });

  it("notifies when delete returns unexpected status", async () => {
    (api.getSkills as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkill as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() => useSkillList());

    await waitFor(() => expect(api.getSkills).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(4);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar la habilidad",
      }),
    );
  });
});
