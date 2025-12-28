import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as blogList from "../../../src/hooks/blog/useBlogList";
import * as blogForm from "../../../src/hooks/blog/useBlogForm";

vi.mock("antd", () => {
  const FormItem = ({ children, rules, label }: any) => {
    if (rules) {
      rules.forEach((rule: any) => {
        if (typeof rule.validator === "function") {
          Promise.resolve(rule.validator({}, undefined)).catch(() => undefined);
        }
      });
    }
    return (
      <div>
        {label ? <span>{label}</span> : null}
        {children}
      </div>
    );
  };

  const Form = ({ children, onFinish }: any) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onFinish?.({});
      }}
    >
      {children}
    </form>
  );
  Form.Item = FormItem;
  Form.useForm = () => [{}];

  const Input = (props: any) => <input {...props} />;
  Input.TextArea = (props: any) => <textarea {...props} />;

  return {
    Button: ({ children, onClick, htmlType, type, disabled }: any) => (
      <button
        type={htmlType ?? "button"}
        onClick={onClick}
        data-type={type}
        disabled={disabled}
      >
        {children}
      </button>
    ),
    Form,
    Input,
    Select: ({ children }: any) => <select>{children}</select>,
    Row: ({ children }: any) => <div>{children}</div>,
    Col: ({ children }: any) => <div>{children}</div>,
    Table: ({ dataSource = [], columns = [] }: any) => (
      <div>
        {dataSource.map((record: any) => (
          <div key={record.id}>
            {columns.map((column: any, index: number) => (
              <div key={`${record.id}-${index}`}>
                {column.render
                  ? column.render(record[column.dataIndex], record)
                  : record[column.dataIndex]}
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
    Typography: {
      Text: ({ children }: any) => <span>{children}</span>,
    },
    Modal: ({ open, title, children, onCancel }: any) =>
      open ? (
        <div data-testid="modal">
          <div>{title}</div>
          <button onClick={onCancel}>cerrar</button>
          {children}
        </div>
      ) : null,
    Popconfirm: ({ children }: any) => <div>{children}</div>,
  };
});

vi.mock("../../../src/components", () => ({
  LoadingBlock: ({ tip }: any) => <div>{tip}</div>,
  SectionHeader: ({ title, action }: any) => (
    <div>
      <h2>{title}</h2>
      {action ? <button onClick={action.onClick}>{action.label}</button> : null}
    </div>
  ),
  ImageSelector: () => <div data-testid="image-selector" />,
  VideoSelector: () => <div data-testid="video-selector" />,
  RichTextEditor: () => <div data-testid="rich-text-editor" />,
}));

vi.mock("../../../src/hooks/blog/useBlogList");
vi.mock("../../../src/hooks/blog/useBlogForm");

import { BlogPage } from "../../../src/pages/blog/BlogPage";

describe("BlogPage coverage", () => {
  const reloadBlogs = vi.fn();
  const setSuccessOnReload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (blogList.useBlogList as unknown as vi.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          title: "Post",
          titleEng: "Post EN",
          cleanUrlTitle: "",
        },
      ],
      isLoading: false,
      isBusy: false,
      pagination: false,
      handleDelete: vi.fn(),
      reloadBlogs,
      setSuccessOnReload,
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

  it("renders the list and opens edit view", async () => {
    const user = userEvent.setup();
    render(<BlogPage />);

    expect(screen.getByText("-")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByRole("heading", { name: /editar blog/i })).toBeInTheDocument();
  });

  it("submits the form and triggers save callbacks", async () => {
    const user = userEvent.setup();
    (blogForm.useBlogForm as unknown as vi.Mock).mockImplementation(
      ({ onSuccess }: any) => ({
        form: undefined,
        isLoading: false,
        isSaving: false,
        blogTypes: [{ id: 1, name: "Tech" }],
        isBlogTypesLoading: false,
        selectedImage: { id: 1, name: "Img", url: "https://img" },
        selectedVideo: {
          id: 2,
          name: "Vid",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
        handleImageSelect: vi.fn(),
        handleVideoSelect: vi.fn(),
        handleSubmit: vi.fn(async () => {
          onSuccess?.("Guardado");
          return true;
        }),
      }),
    );

    render(<BlogPage />);

    await user.click(screen.getByRole("button", { name: /crear blog/i }));
    await user.click(screen.getByRole("button", { name: /guardar blog/i }));

    expect(setSuccessOnReload).toHaveBeenCalledWith("Guardado");
    expect(reloadBlogs).toHaveBeenCalled();
    expect(screen.getByText("Blogs")).toBeInTheDocument();
  });

  it("handles image and video previews", async () => {
    const user = userEvent.setup();
    (blogForm.useBlogForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      blogTypes: [],
      isBlogTypesLoading: false,
      selectedImage: { id: 1, name: "Img", url: "https://img" },
      selectedVideo: {
        id: 2,
        name: "Vid",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      handleImageSelect: vi.fn(),
      handleVideoSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<BlogPage />);

    await user.click(screen.getByRole("button", { name: /crear blog/i }));

    await user.click(screen.getByRole("button", { name: "Ver imagen Img" }));
    expect(screen.getByText("Imagen Img")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "cerrar" }));

    await user.click(screen.getByRole("button", { name: "Reproducir Vid" }));
    expect(screen.getByTitle("Video preview")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    );
  });

  it("shows fallback labels for missing selections and invalid video urls", async () => {
    const user = userEvent.setup();
    (blogForm.useBlogForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      blogTypes: [],
      isBlogTypesLoading: false,
      selectedImage: null,
      selectedVideo: { id: 3, name: "Vid", url: "https://example.com" },
      handleImageSelect: vi.fn(),
      handleVideoSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<BlogPage />);

    await user.click(screen.getByRole("button", { name: /crear blog/i }));

    expect(screen.getByText("Sin imagen seleccionada")).toBeInTheDocument();
    expect(screen.getByText("URL inválida")).toBeInTheDocument();
  });

  it("shows loading and busy states", async () => {
    const user = userEvent.setup();
    (blogForm.useBlogForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: true,
      isSaving: false,
      blogTypes: [],
      isBlogTypesLoading: false,
      selectedImage: null,
      selectedVideo: null,
      handleImageSelect: vi.fn(),
      handleVideoSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<BlogPage />);
    await user.click(screen.getByRole("button", { name: /crear blog/i }));
    expect(screen.getByText("Cargando blog...")).toBeInTheDocument();

    (blogForm.useBlogForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: true,
      blogTypes: [],
      isBlogTypesLoading: false,
      selectedImage: null,
      selectedVideo: null,
      handleImageSelect: vi.fn(),
      handleVideoSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<BlogPage />);
    await user.click(screen.getByRole("button", { name: /crear blog/i }));
    expect(screen.getByText("Procesando...")).toBeInTheDocument();
  });
});
