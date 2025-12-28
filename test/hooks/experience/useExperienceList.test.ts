import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import * as api from "../../../src/api";
import { useExperienceList } from "../../../src/hooks/experience/useExperienceList";

const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock("../../../src/api");
vi.mock("../../../src/hooks/useNotifier", () => ({
  useNotifier: () => ({ notifySuccess, notifyError }),
}));

describe("useExperienceList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getExperiences as unknown as vi.Mock).mockResolvedValue([]);
  });

  it("loads experiences and supports reload success message", async () => {
    const { result } = renderHook(() => useExperienceList());

    await waitFor(() => expect(api.getExperiences).toHaveBeenCalled());

    act(() => {
      result.current.setSuccessOnReload("Ok");
    });

    await act(async () => {
      await result.current.reloadExperiences();
    });

    expect(notifySuccess).toHaveBeenCalledWith({
      message: "Ok",
      description: "Ok",
    });
  });

  it("handles undefined responses", async () => {
    (api.getExperiences as unknown as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useExperienceList());

    await waitFor(() => expect(api.getExperiences).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it("handles delete success and reloads", async () => {
    (api.deleteExperience as unknown as vi.Mock).mockResolvedValue({ status: 204 });

    const { result } = renderHook(() => useExperienceList());

    await waitFor(() => expect(api.getExperiences).toHaveBeenCalled());
    (api.getExperiences as unknown as vi.Mock).mockClear();

    await act(async () => {
      await result.current.handleDelete(3);
    });

    expect(api.deleteExperience).toHaveBeenCalledWith(3);
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Experiencia eliminada" }),
    );
    await waitFor(() => expect(api.getExperiences).toHaveBeenCalled());
  });

  it("notifies when delete fails", async () => {
    (api.deleteExperience as unknown as vi.Mock).mockResolvedValue({ status: 500 });

    const { result } = renderHook(() => useExperienceList());

    await waitFor(() => expect(api.getExperiences).toHaveBeenCalled());

    await act(async () => {
      await result.current.handleDelete(8);
    });

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "No se pudo eliminar la experiencia",
      }),
    );
  });

  it("notifies when load fails", async () => {
    (api.getExperiences as unknown as vi.Mock).mockRejectedValue(new Error("boom"));

    renderHook(() => useExperienceList());

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "No se pudo cargar la lista de experiencias",
        }),
      ),
    );
  });
});
