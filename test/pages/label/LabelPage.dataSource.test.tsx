import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const tablePropsSpy = vi.fn();

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    Table: (props: Record<string, unknown>) => {
      tablePropsSpy(props);
      return <div data-testid="mock-table" />;
    },
  };
});

vi.mock("@refinedev/antd", () => ({
  useTable: () => ({
    tableProps: {
      dataSource: undefined,
      loading: false,
      pagination: false,
    },
    tableQuery: { refetch: vi.fn() },
  }),
}));

vi.mock("@refinedev/core", () => ({
  useNotification: () => ({ open: vi.fn(), close: vi.fn() }),
}));

vi.mock("../../../src/api/labelProvider", () => ({
  createLabel: vi.fn(),
  deleteLabel: vi.fn(),
}));

describe("LabelPage dataSource fallback", () => {
  beforeEach(() => {
    tablePropsSpy.mockClear();
  });

  it("passes an empty array when table dataSource is undefined", async () => {
    vi.resetModules();
    const { LabelPage } = await import("../../../src/pages/label/LabelPage");

    render(<LabelPage />);

    const lastProps = tablePropsSpy.mock.calls.at(-1)?.[0];
    expect(lastProps?.dataSource).toEqual([]);
  });
});
