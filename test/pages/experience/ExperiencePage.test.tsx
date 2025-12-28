import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ExperiencePage } from "../../../src/pages/experience/ExperiencePage";
import * as experienceList from "../../../src/hooks/experience/useExperienceList";
import * as experienceForm from "../../../src/hooks/experience/useExperienceForm";

vi.mock("../../../src/hooks/experience/useExperienceList");
vi.mock("../../../src/hooks/experience/useExperienceForm");
vi.mock("../../../src/components", async () => {
  const actual = await vi.importActual<typeof import("../../../src/components")>(
    "../../../src/components",
  );
  return {
    ...actual,
    SkillSonSelector: () => <div data-testid="skill-son-selector" />,
  };
});

describe("ExperiencePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (experienceList.useExperienceList as unknown as vi.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          company: "Acme",
          yearStart: "2022-01-01",
          yearEnd: "2022-12-31",
        },
      ],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadExperiences: vi.fn(),
      setSuccessOnReload: vi.fn(),
    });
    (experienceForm.useExperienceForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      selectedSkillSons: [],
      handleSkillSonsSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("renders the list view with data", () => {
    render(<ExperiencePage />);

    expect(screen.getByText("Experiencias")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it(
    "can navigate to create view and back",
    async () => {
    const user = userEvent.setup();
    render(<ExperiencePage />);

    await user.click(
      screen.getByRole("button", { name: /crear experiencia/i }),
    );
    expect(
      screen.getByRole("heading", { name: /crear experiencia/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    expect(screen.getByText("Experiencias")).toBeInTheDocument();
    },
    10000,
  );
});
