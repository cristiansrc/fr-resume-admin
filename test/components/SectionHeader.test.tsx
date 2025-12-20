import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SectionHeader } from "../../src/components/SectionHeader";

const ActionIcon = () => <span data-testid="action-icon">+</span>;

describe("SectionHeader", () => {
  it("renders the title", () => {
    render(<SectionHeader title="Seccion" />);

    expect(screen.getByRole("heading", { name: "Seccion" })).toBeInTheDocument();
  });

  it("renders the action button when action is provided", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SectionHeader
        title="Con accion"
        action={{ label: "Crear", onClick, icon: <ActionIcon /> }}
      />,
    );

    expect(screen.getByTestId("action-icon")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "+Crear" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not render the action button when action is missing", () => {
    const { container } = render(<SectionHeader title="Sin accion" />);

    expect(container.querySelector("button")).toBeNull();
  });

  it("applies extra button props", () => {
    render(
      <SectionHeader
        title="Props"
        action={{
          label: "Guardar",
          onClick: () => {},
          buttonProps: { disabled: true, "data-testid": "action-button" },
        }}
      />,
    );

    const button = screen.getByTestId("action-button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
