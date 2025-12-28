import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceSelectorModal } from "../../../src/components/resource-selector/ResourceSelectorModal";

let tablePropsRef: unknown;

vi.mock("antd", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Modal: ({
    open,
    onOk,
    onCancel,
    okText,
    cancelText,
    okButtonProps,
    title,
    children,
  }: any) =>
    open ? (
      <div data-testid="modal">
        <div>{title}</div>
        <button onClick={onOk} disabled={okButtonProps?.disabled}>
          {okText}
        </button>
        <button onClick={onCancel}>{cancelText}</button>
        {children}
      </div>
    ) : null,
  Table: (props: any) => {
    tablePropsRef = props;
    return <div data-testid="table" />;
  },
  Typography: {
    Text: ({ children }: any) => <span>{children}</span>,
  },
}));

describe("ResourceSelectorModal", () => {
  beforeEach(() => {
    tablePropsRef = undefined;
  });

  it("opens the modal and confirms selection", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ResourceSelectorModal
        title="Seleccionar"
        buttonLabel="Abrir"
        tableProps={{ dataSource: [{ id: 1 }], loading: false, pagination: false }}
        columns={[{ title: "ID", dataIndex: "id" }]}
        initialSelectedIds={[1, 2]}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("2 seleccionados")).toBeInTheDocument();

    const tableProps = tablePropsRef as { rowSelection: any };
    tableProps.rowSelection.onChange([3], [{ id: 3 }]);

    await user.click(screen.getByRole("button", { name: "Seleccionar" }));
    expect(onConfirm).toHaveBeenCalledWith([3], [{ id: 3 }]);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("uses radio selection for single mode", async () => {
    const user = userEvent.setup();
    render(
      <ResourceSelectorModal
        title="Seleccionar"
        buttonLabel="Abrir"
        selectionMode="single"
        tableProps={{ dataSource: [{ id: 1 }], loading: false, pagination: false }}
        columns={[{ title: "ID", dataIndex: "id" }]}
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));

    const tableProps = tablePropsRef as { rowSelection: any };
    expect(tableProps.rowSelection.type).toBe("radio");
  });

  it("disables confirm when nothing is selected", async () => {
    const user = userEvent.setup();
    render(
      <ResourceSelectorModal
        title="Seleccionar"
        buttonLabel="Abrir"
        tableProps={{ dataSource: [], loading: false, pagination: false }}
        columns={[{ title: "ID", dataIndex: "id" }]}
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByRole("button", { name: "Seleccionar" })).toBeDisabled();
  });

  it("closes the modal on cancel", async () => {
    const user = userEvent.setup();
    render(
      <ResourceSelectorModal
        title="Seleccionar"
        buttonLabel="Abrir"
        tableProps={{ dataSource: [], loading: false, pagination: false }}
        columns={[{ title: "ID", dataIndex: "id" }]}
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
