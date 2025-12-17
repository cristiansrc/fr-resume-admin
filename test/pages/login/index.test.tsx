import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Login } from "../../../src/pages/login";
import * as refineCore from "@refinedev/core";

vi.mock("@refinedev/core");
const navigateMock = vi.fn();
vi.mock(
  "react-router-dom",
  () => ({
    Navigate: (props: { to: string; replace: boolean }) => {
      navigateMock(props);
      return <div data-testid="navigate" />;
    },
  }),
  { virtual: true },
);

const mutateMock = vi.fn();

describe("Login page", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    (refineCore.useLogin as unknown as vi.Mock).mockReturnValue({
      mutate: mutateMock,
      isLoading: false,
      error: undefined,
    });
    (refineCore.useIsAuthenticated as unknown as vi.Mock).mockReturnValue({
      data: { authenticated: false },
      isLoading: false,
    });
    (refineCore.useLogout as unknown as vi.Mock).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });
  });

  it("renders the login form and calls mutate with credentials", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/Usuario/i), "demo");
    await user.type(screen.getByLabelText(/Contraseña/i), "secret");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith({
        username: "demo",
        password: "secret",
      }),
    );
  });

  it("redirects to home when session already exists", () => {
    (refineCore.useIsAuthenticated as unknown as vi.Mock).mockReturnValue({
      data: { authenticated: true },
      isLoading: false,
    });

    render(<Login />);
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("shows an error alert when login fails", () => {
    const errorMessage = "Credenciales incorrectas";
    (refineCore.useLogin as unknown as vi.Mock).mockReturnValue({
      mutate: mutateMock,
      isLoading: false,
      error: new Error(errorMessage),
    });
    (refineCore.useIsAuthenticated as unknown as vi.Mock).mockReturnValue({
      data: { authenticated: false },
      isLoading: false,
    });

    render(<Login />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
