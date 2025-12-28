import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SkillTypePage } from "../../../src/pages/skill-type/SkillTypePage";
import * as skillTypeList from "../../../src/hooks/skill-type/useSkillTypeList";
import * as skillTypeForm from "../../../src/hooks/skill-type/useSkillTypeForm";

vi.mock("../../../src/hooks/skill-type/useSkillTypeList");
vi.mock("../../../src/hooks/skill-type/useSkillTypeForm");
vi.mock("../../../src/components", async () => {
  const actual = await vi.importActual<typeof import("../../../src/components")>(
    "../../../src/components",
  );
  return {
    ...actual,
    SkillSelector: () => <div data-testid="skill-selector" />,
  };
});

describe("SkillTypePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (skillTypeList.useSkillTypeList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "Frontend", nameEng: "Frontend" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadSkillTypes: vi.fn(),
      setSuccessOnReload: vi.fn(),
    });
    (skillTypeForm.useSkillTypeForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      selectedSkills: [],
      handleSkillsSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("renders the list view with data", () => {
    render(<SkillTypePage />);

    expect(screen.getByText("Tipos de habilidad")).toBeInTheDocument();
    expect(screen.getAllByText("Frontend").length).toBeGreaterThan(0);
  });

  it(
    "can navigate to create view and back",
    async () => {
    const user = userEvent.setup();
    render(<SkillTypePage />);

    await user.click(
      screen.getByRole("button", { name: /crear tipo de habilidad/i }),
    );
    expect(
      screen.getByRole("heading", { name: /crear tipo de habilidad/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    expect(screen.getByText("Tipos de habilidad")).toBeInTheDocument();
    },
    10000,
  );
});
