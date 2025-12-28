import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SkillSonPage } from "../../../src/pages/skill-son/SkillSonPage";
import * as skillSonList from "../../../src/hooks/skill-son/useSkillSonList";
import * as skillSonForm from "../../../src/hooks/skill-son/useSkillSonForm";

vi.mock("../../../src/hooks/skill-son/useSkillSonList");
vi.mock("../../../src/hooks/skill-son/useSkillSonForm");

describe("SkillSonPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (skillSonList.useSkillSonList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "API", nameEng: "API" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadSkillSons: vi.fn(),
      setSuccessOnReload: vi.fn(),
    });
    (skillSonForm.useSkillSonForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("renders the list view with data", () => {
    render(<SkillSonPage />);

    expect(screen.getByText("Habilidades hijas")).toBeInTheDocument();
    expect(screen.getAllByText("API").length).toBeGreaterThan(0);
  });

  it(
    "can navigate to create view and back",
    async () => {
    const user = userEvent.setup();
    render(<SkillSonPage />);

    await user.click(
      screen.getByRole("button", { name: /crear habilidad hija/i }),
    );
    expect(
      screen.getByRole("heading", { name: /crear habilidad hija/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    expect(screen.getByText("Habilidades hijas")).toBeInTheDocument();
    },
    10000,
  );
});
