import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSkillTypeList } from "../../../src/hooks/skill-type/useSkillTypeList";
import * as api from "../../../src/api";

const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useSkillTypeList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads skill types and exposes the data", async () => {
    (api.getSkillTypes as unknown as vi.Mock).mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useSkillTypeList());

    await waitFor(() => expect(api.getSkillTypes).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));
  });

  it("shows a success message on reload when pending message is set", async () => {
    (api.getSkillTypes as unknown as vi.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useSkillTypeList());

    await waitFor(() => expect(api.getSkillTypes).toHaveBeenCalled());

    act(() => result.current.setSuccessOnReload("Actualizado"));
    await act(async () => {
      await result.current.reloadSkillTypes();
    });

    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Actualizado" }),
    );
  });

  it("deletes a skill type and reloads the list on success", async () => {
    (api.getSkillTypes as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkillType as unknown as vi.Mock).mockResolvedValue({ status: 204 });

    const { result } = renderHook(() => useSkillTypeList());

    await waitFor(() => expect(api.getSkillTypes).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(10);
    });

    expect(api.deleteSkillType).toHaveBeenCalledWith(10);
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tipo de habilidad eliminado" }),
    );
  });

  it("notifies when delete fails", async () => {
    (api.getSkillTypes as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkillType as unknown as vi.Mock).mockRejectedValue(
      new Error("boom"),
    );

    const { result } = renderHook(() => useSkillTypeList());

    await waitFor(() => expect(api.getSkillTypes).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(3);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar el tipo de habilidad",
      }),
    );
  });

  it("notifies when load fails", async () => {
    (api.getSkillTypes as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useSkillTypeList());

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la lista de tipos de habilidad",
        }),
      ),
    );
  });

  it("notifies when delete returns unexpected status", async () => {
    (api.getSkillTypes as unknown as vi.Mock).mockResolvedValue([]);
    (api.deleteSkillType as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() => useSkillTypeList());

    await waitFor(() => expect(api.getSkillTypes).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(4);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar el tipo de habilidad",
      }),
    );
  });
});
