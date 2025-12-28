import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { SkillSonSelector } from "../../../src/components/resource-selector/SkillSonSelector";
import { getSkillSons } from "../../../src/api";

let latestProps: any;

vi.mock("../../../src/api", () => ({
  getSkillSons: vi.fn(),
}));

vi.mock("../../../src/components/resource-selector/ResourceSelectorModal", () => ({
  ResourceSelectorModal: (props: any) => {
    latestProps = props;
    return <div data-testid="resource-selector-modal" />;
  },
}));

const getSkillSonsMock = getSkillSons as unknown as vi.Mock;

describe("SkillSonSelector", () => {
  beforeEach(() => {
    latestProps = undefined;
    getSkillSonsMock.mockReset();
  });

  it("loads skill sons and forwards the props", async () => {
    const onConfirm = vi.fn();
    const skillSons = [
      { id: 3, name: "Skill Son 1", nameEng: "Skill Son One" },
    ];
    getSkillSonsMock.mockResolvedValue(skillSons);

    render(
      <SkillSonSelector
        selectionMode="single"
        buttonLabel="Abrir"
        title="Skill Sons"
        initialSelectedIds={[3]}
        onConfirm={onConfirm}
        disabled
      />,
    );

    await waitFor(() => expect(getSkillSonsMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(latestProps.tableProps.dataSource).toEqual(skillSons),
    );

    expect(screen.getByTestId("resource-selector-modal")).toBeInTheDocument();
    expect(latestProps.selectionMode).toBe("single");
    expect(latestProps.title).toBe("Skill Sons");
    expect(latestProps.buttonLabel).toBe("Abrir");
    expect(latestProps.initialSelectedIds).toEqual([3]);
    expect(latestProps.onConfirm).toBe(onConfirm);
    expect(latestProps.disabled).toBe(true);
    expect(latestProps.columns).toHaveLength(3);
    expect(latestProps.columns[0].dataIndex).toBe("id");
  });

  it("falls back to an empty list when response is undefined", async () => {
    getSkillSonsMock.mockResolvedValue(undefined);

    render(
      <SkillSonSelector
        selectionMode="multiple"
        buttonLabel="Abrir"
        title="Skill Sons"
        onConfirm={vi.fn()}
      />,
    );

    await waitFor(() => expect(getSkillSonsMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(latestProps.tableProps.dataSource).toEqual([]),
    );
  });
});
