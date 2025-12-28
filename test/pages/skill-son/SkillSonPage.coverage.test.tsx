import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as skillSonList from "../../../src/hooks/skill-son/useSkillSonList";
import * as skillSonForm from "../../../src/hooks/skill-son/useSkillSonForm";

vi.mock("antd", () => {
  const FormItem = ({ children }: any) => <div>{children}</div>;

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

vi.mock("../../../src/hooks/skill-son/useSkillSonList");
vi.mock("../../../src/hooks/skill-son/useSkillSonForm");

import { SkillSonPage } from "../../../src/pages/skill-son/SkillSonPage";

describe("SkillSonPage coverage", () => {
  const reloadSkillSons = vi.fn();
  const setSuccessOnReload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (skillSonList.useSkillSonList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "Son", nameEng: "Son EN" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadSkillSons,
      setSuccessOnReload,
    });
    (skillSonForm.useSkillSonForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: false,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it("opens edit view from the table", async () => {
    const user = userEvent.setup();
    render(<SkillSonPage />);

    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(
      screen.getByRole("heading", { name: /editar habilidad hija/i }),
    ).toBeInTheDocument();
  });

  it("submits the form and reloads the list", async () => {
    const user = userEvent.setup();
    (skillSonForm.useSkillSonForm as unknown as vi.Mock).mockImplementation(
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

    render(<SkillSonPage />);

    await user.click(
      screen.getByRole("button", { name: /crear habilidad hija/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /guardar habilidad/i }),
    );

    expect(setSuccessOnReload).toHaveBeenCalledWith("Guardado");
    expect(reloadSkillSons).toHaveBeenCalled();
    expect(screen.getByText("Habilidades hijas")).toBeInTheDocument();
  });

  it("shows busy and loading states", async () => {
    const user = userEvent.setup();
    (skillSonForm.useSkillSonForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: true,
      isSaving: false,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<SkillSonPage />);
    await user.click(
      screen.getByRole("button", { name: /crear habilidad hija/i }),
    );
    expect(screen.getByText("Cargando habilidad hija...")).toBeInTheDocument();

    (skillSonForm.useSkillSonForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: true,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<SkillSonPage />);
    await user.click(
      screen.getByRole("button", { name: /crear habilidad hija/i }),
    );
    expect(screen.getByText("Procesando...")).toBeInTheDocument();
  });
});
