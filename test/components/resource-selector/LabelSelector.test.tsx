import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTable } from "@refinedev/antd";

import { LabelSelector } from "../../../src/components/resource-selector/LabelSelector";
import { LABEL_RESOURCE } from "../../../src/config/label-config";

let latestProps: any;

vi.mock("@refinedev/antd", () => ({
  useTable: vi.fn(),
}));

vi.mock("../../../src/components/resource-selector/ResourceSelectorModal", () => ({
  ResourceSelectorModal: (props: any) => {
    latestProps = props;
    return <div data-testid="resource-selector-modal" />;
  },
}));

const useTableMock = useTable as unknown as vi.Mock;

describe("LabelSelector", () => {
  beforeEach(() => {
    latestProps = undefined;
    useTableMock.mockReset();
    useTableMock.mockReturnValue({
      tableProps: {
        dataSource: [{ id: 1, name: "Label" }],
        loading: false,
        pagination: false,
      },
    });
  });

  it("configures the table and forwards props", () => {
    const onConfirm = vi.fn();

    render(
      <LabelSelector
        selectionMode="single"
        buttonLabel="Abrir"
        title="Seleccion"
        initialSelectedIds={[1, 2]}
        onConfirm={onConfirm}
        disabled
      />,
    );

    expect(useTableMock).toHaveBeenCalledWith({
      resource: LABEL_RESOURCE,
      pagination: { pageSize: 10 },
    });
    expect(screen.getByTestId("resource-selector-modal")).toBeInTheDocument();
    expect(latestProps.selectionMode).toBe("single");
    expect(latestProps.buttonLabel).toBe("Abrir");
    expect(latestProps.title).toBe("Seleccion");
    expect(latestProps.initialSelectedIds).toEqual([1, 2]);
    expect(latestProps.onConfirm).toBe(onConfirm);
    expect(latestProps.disabled).toBe(true);
    expect(latestProps.columns).toHaveLength(3);
    expect(latestProps.columns[2].dataIndex).toBe("nameEng");
  });
});
