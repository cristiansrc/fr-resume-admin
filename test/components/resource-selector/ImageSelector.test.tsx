import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTable } from "@refinedev/antd";

import { ImageSelector } from "../../../src/components/resource-selector/ImageSelector";
import { IMAGE_RESOURCE } from "../../../src/config/image-config";

let latestProps: any;

vi.mock("@refinedev/antd", () => ({
  useTable: vi.fn(),
}));

vi.mock("antd", () => ({
  Modal: ({ open, title, children, onCancel }: any) =>
    open ? (
      <div data-testid="image-preview-modal">
        <div>{title}</div>
        <button onClick={onCancel}>cerrar</button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../../../src/components/resource-selector/ResourceSelectorModal", () => ({
  ResourceSelectorModal: (props: any) => {
    latestProps = props;
    const dataSource = props.tableProps?.dataSource ?? [];
    return (
      <div data-testid="resource-selector-modal">
        {dataSource.map((record: any) => (
          <div key={record.id}>
            {props.columns.map((col: any, index: number) => (
              <div key={`${record.id}-${index}`}>
                {col.render
                  ? col.render(record[col.dataIndex], record)
                  : record[col.dataIndex]}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

const useTableMock = useTable as unknown as vi.Mock;

describe("ImageSelector", () => {
  beforeEach(() => {
    latestProps = undefined;
    useTableMock.mockReset();
    useTableMock.mockReturnValue({
      tableProps: {
        dataSource: [
          {
            id: 10,
            name: "Logo",
            nameEng: "Logo",
            url: "https://example.com/logo.png",
          },
        ],
        loading: false,
        pagination: false,
      },
    });
  });

  it("opens and closes the image preview modal", async () => {
    const user = userEvent.setup();
    render(
      <ImageSelector
        selectionMode="multiple"
        buttonLabel="Abrir"
        title="Imagenes"
        onConfirm={vi.fn()}
      />,
    );

    expect(useTableMock).toHaveBeenCalledWith({
      resource: IMAGE_RESOURCE,
      pagination: { pageSize: 10 },
    });
    expect(screen.getByTestId("resource-selector-modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ver imagen Logo" }));
    expect(screen.getByTestId("image-preview-modal")).toBeInTheDocument();
    expect(screen.getByText("Imagen Logo")).toBeInTheDocument();
    expect(screen.getByAltText("Imagen Logo")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "cerrar" }));
    expect(
      screen.queryByTestId("image-preview-modal"),
    ).not.toBeInTheDocument();
    expect(latestProps.columns).toHaveLength(4);
  });
});
