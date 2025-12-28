import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BlogTypePage } from "../../../src/pages/blog-type/BlogTypePage";
import * as blogTypeList from "../../../src/hooks/blog-type/useBlogTypeList";
import * as blogTypeForm from "../../../src/hooks/blog-type/useBlogTypeForm";

vi.mock("../../../src/hooks/blog-type/useBlogTypeList");
vi.mock("../../../src/hooks/blog-type/useBlogTypeForm");

describe("BlogTypePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (blogTypeList.useBlogTypeList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "Tech", nameEng: "Tech" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadBlogTypes: vi.fn(),
      setSuccessOnReload: vi.fn(),
    });
    (blogTypeForm.useBlogTypeForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("renders the list view with data", () => {
    render(<BlogTypePage />);

    expect(screen.getByText("Tipos de blog")).toBeInTheDocument();
    expect(screen.getAllByText("Tech").length).toBeGreaterThan(0);
  });

  it(
    "can navigate to create view and back",
    async () => {
    const user = userEvent.setup();
    render(<BlogTypePage />);

    await user.click(
      screen.getByRole("button", { name: /crear tipo de blog/i }),
    );
    expect(
      screen.getByRole("heading", { name: /crear tipo de blog/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    expect(screen.getByText("Tipos de blog")).toBeInTheDocument();
    },
    10000,
  );
});
