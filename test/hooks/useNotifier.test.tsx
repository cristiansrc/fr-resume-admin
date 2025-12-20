import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { message, notification } from "antd";
import { useNotifier } from "../../src/hooks/useNotifier";

const openMock = vi.fn();

vi.mock("@refinedev/core", () => ({
  useNotification: () => ({ open: openMock }),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
    notification: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe("useNotifier", () => {
  beforeEach(() => {
    openMock.mockReset();
    (message.success as unknown as vi.Mock).mockReset();
    (message.error as unknown as vi.Mock).mockReset();
    (notification.success as unknown as vi.Mock).mockReset();
    (notification.error as unknown as vi.Mock).mockReset();
  });

  it("uses description fallback to message when missing", () => {
    const { result } = renderHook(() => useNotifier());

    act(() => {
      result.current.notifySuccess({ message: "Hecho" });
    });

    expect(notification.success).toHaveBeenCalledWith({
      message: "Hecho",
      description: undefined,
    });
    expect(message.success).toHaveBeenCalledWith("Hecho");
    expect(openMock).toHaveBeenCalledWith({
      type: "success",
      message: "Hecho",
      description: "Hecho",
    });
  });

  it("uses provided description when available", () => {
    const { result } = renderHook(() => useNotifier());

    act(() => {
      result.current.notifyError({
        message: "Error",
        description: "Algo salio mal",
      });
    });

    expect(notification.error).toHaveBeenCalledWith({
      message: "Error",
      description: "Algo salio mal",
    });
    expect(message.error).toHaveBeenCalledWith("Algo salio mal");
    expect(openMock).toHaveBeenCalledWith({
      type: "error",
      message: "Error",
      description: "Algo salio mal",
    });
  });
});
