import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as skillList from "../../../src/hooks/skill/useSkillList";
import * as skillForm from "../../../src/hooks/skill/useSkillForm";

let skillSonSelectorProps: any;

vi.mock("antd", () => {
  const FormItem = ({ children, rules, label }: any) => {
    if (rules) {
      rules.forEach((rule: any) => {
        if (typeof rule.validator === "function") {
          Promise.resolve(rule.validator({}, [])).catch(() => undefined);
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
    Button: ({ children, onClick, htmlType, type }: any) => (
      <button type={htmlType ?? "button"} onClick={onClick} data-type={type}>
        {children}
      </button>
    ),
    Form,
    Input,
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
    Tag: ({ children }: any) => <span>{children}</span>,
    Typography: {
      Text: ({ children }: any) => <span>{children}</span>,
    },
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
  SkillSonSelector: (props: any) => {
    skillSonSelectorProps = props;
    return <div data-testid="skill-son-selector" />;
  },
}));

vi.mock("../../../src/hooks/skill/useSkillList");
vi.mock("../../../src/hooks/skill/useSkillForm");

import { SkillPage } from "../../../src/pages/skill/SkillPage";

describe("SkillPage coverage", () => {
  const reloadSkills = vi.fn();
  const setSuccessOnReload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    skillSonSelectorProps = undefined;
    (skillList.useSkillList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "Skill", nameEng: "Skill EN" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadSkills,
      setSuccessOnReload,
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

  it("renders empty skill son selection and opens edit view", async () => {
    const user = userEvent.setup();
    render(<SkillPage />);

    await user.click(screen.getByRole("button", { name: /crear habilidad/i }));
    expect(
      screen.getByText("Sin habilidades hijas seleccionadas"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(
      screen.getByRole("heading", { name: /editar habilidad/i }),
    ).toBeInTheDocument();
  });

  it("submits the form and triggers save callbacks", async () => {
    const user = userEvent.setup();
    (skillForm.useSkillForm as unknown as vi.Mock).mockImplementation(
      ({ onSuccess }: any) => ({
        form: undefined,
        isLoading: false,
        isSaving: false,
        selectedSkillSons: [{ id: 1, name: "Son" }],
        handleSkillSonsSelect: vi.fn(),
        handleSubmit: vi.fn(async () => {
          onSuccess?.("Guardado");
          return true;
        }),
      }),
    );

    render(<SkillPage />);

    await user.click(screen.getByRole("button", { name: /crear habilidad/i }));
    expect(screen.getByText("Son")).toBeInTheDocument();
    expect(skillSonSelectorProps.initialSelectedIds).toEqual([1]);

    await user.click(
      screen.getByRole("button", { name: /guardar habilidad/i }),
    );

    expect(setSuccessOnReload).toHaveBeenCalledWith("Guardado");
    expect(reloadSkills).toHaveBeenCalled();
    expect(screen.getByText("Habilidades")).toBeInTheDocument();
  });

  it("shows busy and loading states", async () => {
    const user = userEvent.setup();
    (skillForm.useSkillForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: true,
      isSaving: false,
      selectedSkillSons: [],
      handleSkillSonsSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<SkillPage />);
    await user.click(screen.getByRole("button", { name: /crear habilidad/i }));
    expect(screen.getByText("Cargando habilidad...")).toBeInTheDocument();

    (skillForm.useSkillForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: true,
      selectedSkillSons: [],
      handleSkillSonsSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<SkillPage />);
    await user.click(screen.getByRole("button", { name: /crear habilidad/i }));
    expect(screen.getByText("Procesando...")).toBeInTheDocument();
  });
});
