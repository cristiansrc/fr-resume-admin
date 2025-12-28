import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { SkillSelector } from "../../../src/components/resource-selector/SkillSelector";
import { getSkills } from "../../../src/api";

let latestProps: any;

vi.mock("../../../src/api", () => ({
  getSkills: vi.fn(),
}));

vi.mock("../../../src/components/resource-selector/ResourceSelectorModal", () => ({
  ResourceSelectorModal: (props: any) => {
    latestProps = props;
    return <div data-testid="resource-selector-modal" />;
  },
}));

const getSkillsMock = getSkills as unknown as vi.Mock;

describe("SkillSelector", () => {
  beforeEach(() => {
    latestProps = undefined;
    getSkillsMock.mockReset();
  });

  it("loads skills and provides the table props", async () => {
    const onConfirm = vi.fn();
    const skills = [
      { id: 1, name: "Skill 1", nameEng: "Skill One" },
      { id: 2, name: "Skill 2", nameEng: "Skill Two" },
    ];
    getSkillsMock.mockResolvedValue(skills);

    render(
      <SkillSelector
        selectionMode="multiple"
        buttonLabel="Abrir"
        title="Skills"
        initialSelectedIds={[2]}
        onConfirm={onConfirm}
      />,
    );

    await waitFor(() => expect(getSkillsMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(latestProps.tableProps.dataSource).toEqual(skills),
    );

    expect(screen.getByTestId("resource-selector-modal")).toBeInTheDocument();
    expect(latestProps.title).toBe("Skills");
    expect(latestProps.buttonLabel).toBe("Abrir");
    expect(latestProps.initialSelectedIds).toEqual([2]);
    expect(latestProps.selectionMode).toBe("multiple");
    expect(latestProps.onConfirm).toBe(onConfirm);
    expect(latestProps.columns).toHaveLength(3);
    expect(latestProps.columns[1].dataIndex).toBe("name");
    expect(latestProps.tableProps.loading).toBe(false);
  });

  it("falls back to an empty list when response is undefined", async () => {
    getSkillsMock.mockResolvedValue(undefined);

    render(
      <SkillSelector
        selectionMode="multiple"
        buttonLabel="Abrir"
        title="Skills"
        onConfirm={vi.fn()}
      />,
    );

    await waitFor(() => expect(getSkillsMock).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(latestProps.tableProps.dataSource).toEqual([]),
    );
  });
});
