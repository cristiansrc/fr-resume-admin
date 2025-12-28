import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSkillSonList } from "../../../src/hooks/skill-son/useSkillSonList";
import * as api from "../../../src/api";

const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useSkillSonList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads skill sons and exposes the data", async () => {
    (api.getSkillSons as unknown as vi.Mock).mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useSkillSonList());

    await waitFor(() => expect(api.getSkillSons).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));
  });

  it("shows a success message on reload when pending message is set", async () => {
    (api.getSkillSons as unknown as vi.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useSkillSonList());

    await waitFor(() => expect(api.getSkillSons).toHaveBeenCalled());

    act(() => result.current.setSuccessOnReload("Actualizado"));
    await act(async () => {
      await result.current.reloadSkillSons();
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Actualizado" }),
    );
  });

  it("deletes a skill son and reloads the list on success", async () => {
    (api.getSkillSons as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkillSon as unknown as vi.Mock).mockResolvedValue({ status: 204 });

    const { result } = renderHook(() => useSkillSonList());

    await waitFor(() => expect(api.getSkillSons).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(10);
    });

    expect(api.deleteSkillSon).toHaveBeenCalledWith(10);
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Habilidad hija eliminada" }),
    );
  });

  it("notifies when delete fails", async () => {
    (api.getSkillSons as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkillSon as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useSkillSonList());

    await waitFor(() => expect(api.getSkillSons).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(3);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar la habilidad hija",
      }),
    );
  });

  it("notifies when load fails", async () => {
    (api.getSkillSons as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useSkillSonList());

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la lista de habilidades hijas",
        }),
      ),
    );
  });

  it("notifies when delete returns unexpected status", async () => {
    (api.getSkillSons as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkillSon as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() => useSkillSonList());

    await waitFor(() => expect(api.getSkillSons).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(4);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar la habilidad hija",
      }),
    );
  });
});
