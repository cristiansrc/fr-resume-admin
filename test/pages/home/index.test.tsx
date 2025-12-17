import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Home } from "../../../src/pages/home";
import * as refineCore from "@refinedev/core";

vi.mock("@refinedev/core");

const logoutMutation = vi.fn();

describe("Home page", () => {
  beforeEach(() => {
    logoutMutation.mockReset();
    (refineCore.useLogout as unknown as vi.Mock).mockReturnValue({
      mutate: logoutMutation,
      isLoading: false,
    });
  });

  it("renders the header title and menu items", () => {
    render(<Home />);

    expect(screen.getByText(/currículum vitae cristhiam reina/i)).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /experiencias/i })).toBeInTheDocument();
  });

  it("calls logout when the dropdown logout button is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByLabelText(/abrir menú de usuario/i));
    await user.click(screen.getByRole("button", { name: /salir/i }));

    expect(logoutMutation).toHaveBeenCalled();
  });
});
