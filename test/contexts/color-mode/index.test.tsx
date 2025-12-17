import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";

import {
  ColorModeContext,
  ColorModeContextProvider,
} from "../../../src/contexts/color-mode";

const Consumer = () => {
  const { mode, setMode } = useContext(ColorModeContext);
  return (
    <div>
      <span data-testid="current-mode">{mode}</span>
      <button data-testid="toggle-mode" onClick={setMode}>
        toggle
      </button>
    </div>
  );
};

describe("ColorModeContextProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("respects the stored color mode", () => {
    localStorage.setItem("colorMode", "dark");

    render(
      <ColorModeContextProvider>
        <Consumer />
      </ColorModeContextProvider>,
    );

    expect(screen.getByTestId("current-mode")).toHaveTextContent("dark");
    expect(localStorage.getItem("colorMode")).toBe("dark");
  });

  it("toggles the color mode and persists the new value", async () => {
    const user = userEvent.setup();
    localStorage.setItem("colorMode", "light");

    render(
      <ColorModeContextProvider>
        <Consumer />
      </ColorModeContextProvider>,
    );

    expect(screen.getByTestId("current-mode")).toHaveTextContent("light");

    await user.click(screen.getByTestId("toggle-mode"));
    await user.click(screen.getByTestId("toggle-mode"));

    expect(screen.getByTestId("current-mode")).toHaveTextContent("light");
    expect(localStorage.getItem("colorMode")).toBe("light");
  });

  it("falls back to system preference when no stored mode exists", () => {
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockImplementation(() => ({
        matches: true,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

    render(
      <ColorModeContextProvider>
        <Consumer />
      </ColorModeContextProvider>,
    );

    expect(screen.getByTestId("current-mode")).toHaveTextContent("dark");
    matchMediaSpy.mockRestore();
  });
});
