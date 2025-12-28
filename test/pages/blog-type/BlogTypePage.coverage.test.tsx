import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as blogTypeList from "../../../src/hooks/blog-type/useBlogTypeList";
import * as blogTypeForm from "../../../src/hooks/blog-type/useBlogTypeForm";

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

  return {
    Button: ({ children, onClick, htmlType, type }: any) => (
      <button type={htmlType ?? "button"} onClick={onClick} data-type={type}>
        {children}
      </button>
    ),
    Form,
    Input: (props: any) => <input {...props} />,
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
}));

vi.mock("../../../src/hooks/blog-type/useBlogTypeList");
vi.mock("../../../src/hooks/blog-type/useBlogTypeForm");

import { BlogTypePage } from "../../../src/pages/blog-type/BlogTypePage";

describe("BlogTypePage coverage", () => {
  const reloadBlogTypes = vi.fn();
  const setSuccessOnReload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (blogTypeList.useBlogTypeList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "Tech", nameEng: "Tech" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadBlogTypes,
      setSuccessOnReload,
    });
    (blogTypeForm.useBlogTypeForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("opens edit view from the table", async () => {
    const user = userEvent.setup();
    render(<BlogTypePage />);

    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(
      screen.getByRole("heading", { name: /editar tipo de blog/i }),
    ).toBeInTheDocument();
  });

  it("submits the form and reloads the list", async () => {
    const user = userEvent.setup();
    (blogTypeForm.useBlogTypeForm as unknown as vi.Mock).mockImplementation(
      ({ onSuccess }: any) => ({
        form: undefined,
        isLoading: false,
        isSaving: false,
        handleSubmit: vi.fn(async () => {
          onSuccess?.("Guardado");
          return true;
        }),
      }),
    );

    render(<BlogTypePage />);

    await user.click(
      screen.getByRole("button", { name: /crear tipo de blog/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /guardar tipo de blog/i }),
    );

    expect(setSuccessOnReload).toHaveBeenCalledWith("Guardado");
    expect(reloadBlogTypes).toHaveBeenCalled();
    expect(screen.getByText("Tipos de blog")).toBeInTheDocument();
  });

  it("shows busy and loading states", async () => {
    const user = userEvent.setup();
    (blogTypeForm.useBlogTypeForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: true,
      isSaving: false,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<BlogTypePage />);
    await user.click(
      screen.getByRole("button", { name: /crear tipo de blog/i }),
    );
    expect(screen.getByText("Cargando tipo de blog...")).toBeInTheDocument();

    (blogTypeForm.useBlogTypeForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: true,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<BlogTypePage />);
    await user.click(
      screen.getByRole("button", { name: /crear tipo de blog/i }),
    );
    expect(screen.getByText("Procesando...")).toBeInTheDocument();
  });
});
