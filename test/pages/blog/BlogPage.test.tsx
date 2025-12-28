import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BlogPage } from "../../../src/pages/blog/BlogPage";
import * as blogList from "../../../src/hooks/blog/useBlogList";
import * as blogForm from "../../../src/hooks/blog/useBlogForm";

vi.mock("../../../src/hooks/blog/useBlogList");
vi.mock("../../../src/hooks/blog/useBlogForm");
vi.mock("../../../src/components", async () => {
  const actual = await vi.importActual<typeof import("../../../src/components")>(
    "../../../src/components",
  );
  return {
    ...actual,
    ImageSelector: () => <div data-testid="image-selector" />,
    VideoSelector: () => <div data-testid="video-selector" />,
    RichTextEditor: () => <div data-testid="rich-text-editor" />,
  };
});

describe("BlogPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (blogList.useBlogList as unknown as vi.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          title: "Post",
          titleEng: "Post EN",
          cleanUrlTitle: "post",
        },
      ],
      isLoading: false,
      isBusy: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 1,
        showSizeChanger: true,
        onChange: vi.fn(),
      },
      handleDelete: vi.fn(),
      reloadBlogs: vi.fn(),
      setSuccessOnReload: vi.fn(),
    });
    (blogForm.useBlogForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      blogTypes: [],
      isBlogTypesLoading: false,
      selectedImage: null,
      selectedVideo: null,
      handleImageSelect: vi.fn(),
      handleVideoSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("renders the list view with data", () => {
    render(<BlogPage />);

    expect(screen.getByText("Blogs")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
    expect(screen.getByText("post")).toBeInTheDocument();
  });

  it(
    "can navigate to create view and back",
    async () => {
    const user = userEvent.setup();
    render(<BlogPage />);

    await user.click(screen.getByRole("button", { name: /crear blog/i }));
    expect(
      screen.getByRole("heading", { name: /crear blog/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    expect(screen.getByText("Blogs")).toBeInTheDocument();
    },
    10000,
  );
});
