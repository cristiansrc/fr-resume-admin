import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Header } from "../../../src/components/header";
import { ColorModeContext } from "../../../src/contexts/color-mode";

const setModeMock = vi.fn();
const useGetIdentityMock = vi.fn();

vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => useGetIdentityMock(),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    theme: {
      ...actual.theme,
      useToken: () => ({ token: { colorBgElevated: "#fafafa" } }),
    },
  };
});

describe("Header component", () => {
  beforeEach(() => {
    setModeMock.mockReset();
    useGetIdentityMock.mockReset();
    useGetIdentityMock.mockReturnValue({
      data: { name: "Test User", avatar: "url" },
    });
  });

  it("renders user identity and toggles color mode", async () => {
    const user = userEvent.setup();
    render(
      <ColorModeContext.Provider value={{ mode: "light", setMode: setModeMock }}>
        <Header />
      </ColorModeContext.Provider>,
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    await user.click(screen.getByRole("switch"));
    expect(setModeMock).toHaveBeenCalledWith("dark");
  });

  it("renders a sticky header by default", () => {
    const { container } = render(
      <ColorModeContext.Provider value={{ mode: "light", setMode: setModeMock }}>
        <Header />
      </ColorModeContext.Provider>,
    );

    const header = container.querySelector(".ant-layout-header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveStyle("position: sticky");
  });

  it("renders a static header when sticky is false", () => {
    const { container } = render(
      <ColorModeContext.Provider value={{ mode: "light", setMode: setModeMock }}>
        <Header sticky={false} />
      </ColorModeContext.Provider>,
    );

    const header = container.querySelector(".ant-layout-header");
    expect(header).toBeInTheDocument();
    expect(header).not.toHaveStyle("position: sticky");
  });

  it("toggles color mode back to light when already dark", async () => {
    const user = userEvent.setup();
    useGetIdentityMock.mockReturnValue({
      data: { name: "Another", avatar: "another-url" },
    });

    render(
      <ColorModeContext.Provider value={{ mode: "dark", setMode: setModeMock }}>
        <Header />
      </ColorModeContext.Provider>,
    );

    await user.click(screen.getByRole("switch"));
    expect(setModeMock).toHaveBeenCalledWith("light");
  });

  it("does not render identity info when missing", () => {
    useGetIdentityMock.mockReturnValue({ data: undefined });

    const { container } = render(
      <ColorModeContext.Provider value={{ mode: "light", setMode: setModeMock }}>
        <Header />
      </ColorModeContext.Provider>,
    );

    expect(container.querySelector(".ant-typography")).toBeNull();
    expect(container.querySelector(".ant-avatar")).toBeNull();
  });
});
