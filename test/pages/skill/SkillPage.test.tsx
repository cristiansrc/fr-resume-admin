import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SkillPage } from "../../../src/pages/skill/SkillPage";
import * as skillList from "../../../src/hooks/skill/useSkillList";
import * as skillForm from "../../../src/hooks/skill/useSkillForm";

vi.mock("../../../src/hooks/skill/useSkillList");
vi.mock("../../../src/hooks/skill/useSkillForm");
vi.mock("../../../src/components", async () => {
  const actual = await vi.importActual<typeof import("../../../src/components")>(
    "../../../src/components",
  );
  return {
    ...actual,
    SkillSonSelector: () => <div data-testid="skill-son-selector" />,
  };
});

describe("SkillPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (skillList.useSkillList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "React", nameEng: "React" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadSkills: vi.fn(),
      setSuccessOnReload: vi.fn(),
    });
    (skillForm.useSkillForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      selectedSkillSons: [],
      handleSkillSonsSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("renders the list view with data", () => {
    render(<SkillPage />);

    expect(screen.getByText("Habilidades")).toBeInTheDocument();
    expect(screen.getAllByText("React").length).toBeGreaterThan(0);
  });

  it(
    "can navigate to create view and back",
    async () => {
    const user = userEvent.setup();
    render(<SkillPage />);

    await user.click(
      screen.getByRole("button", { name: /crear habilidad/i }),
    );
    expect(
      screen.getByRole("heading", { name: /crear habilidad/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    expect(screen.getByText("Habilidades")).toBeInTheDocument();
    },
    10000,
  );
});
