import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as skillTypeList from "../../../src/hooks/skill-type/useSkillTypeList";
import * as skillTypeForm from "../../../src/hooks/skill-type/useSkillTypeForm";

let skillSelectorProps: any;

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
  SkillSelector: (props: any) => {
    skillSelectorProps = props;
    return <div data-testid="skill-selector" />;
  },
}));

vi.mock("../../../src/hooks/skill-type/useSkillTypeList");
vi.mock("../../../src/hooks/skill-type/useSkillTypeForm");

import { SkillTypePage } from "../../../src/pages/skill-type/SkillTypePage";

describe("SkillTypePage coverage", () => {
  const reloadSkillTypes = vi.fn();
  const setSuccessOnReload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    skillSelectorProps = undefined;
    (skillTypeList.useSkillTypeList as unknown as vi.Mock).mockReturnValue({
      data: [{ id: 1, name: "Type", nameEng: "Type EN" }],
      isLoading: false,
      isBusy: false,
      handleDelete: vi.fn(),
      reloadSkillTypes,
      setSuccessOnReload,
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

  it("renders empty skill selection and opens edit view", async () => {
    const user = userEvent.setup();
    render(<SkillTypePage />);

    await user.click(
      screen.getByRole("button", { name: /crear tipo de habilidad/i }),
    );
    expect(
      screen.getByText("Sin habilidades seleccionadas"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /volver/i }));
    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(
      screen.getByRole("heading", { name: /editar tipo de habilidad/i }),
    ).toBeInTheDocument();
  });

  it("submits the form and triggers save callbacks", async () => {
    const user = userEvent.setup();
    (skillTypeForm.useSkillTypeForm as unknown as vi.Mock).mockImplementation(
      ({ onSuccess }: any) => ({
        form: undefined,
        isLoading: false,
        isSaving: false,
        selectedSkills: [{ id: 1, name: "Skill" }],
        handleSkillsSelect: vi.fn(),
        handleSubmit: vi.fn(async () => {
          onSuccess?.("Guardado");
          return true;
        }),
      }),
    );

    render(<SkillTypePage />);

    await user.click(
      screen.getByRole("button", { name: /crear tipo de habilidad/i }),
    );
    expect(screen.getByText("Skill")).toBeInTheDocument();
    expect(skillSelectorProps.initialSelectedIds).toEqual([1]);

    await user.click(
      screen.getByRole("button", { name: /guardar tipo de habilidad/i }),
    );

    expect(setSuccessOnReload).toHaveBeenCalledWith("Guardado");
    expect(reloadSkillTypes).toHaveBeenCalled();
    expect(screen.getByText("Tipos de habilidad")).toBeInTheDocument();
  });

  it("shows busy and loading states", async () => {
    const user = userEvent.setup();
    (skillTypeForm.useSkillTypeForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: true,
      isSaving: false,
      selectedSkills: [],
      handleSkillsSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<SkillTypePage />);
    await user.click(
      screen.getByRole("button", { name: /crear tipo de habilidad/i }),
    );
    expect(screen.getByText("Cargando tipo de habilidad...")).toBeInTheDocument();

    (skillTypeForm.useSkillTypeForm as unknown as vi.Mock).mockReturnValue({
      form: undefined,
      isLoading: false,
      isSaving: true,
      selectedSkills: [],
      handleSkillsSelect: vi.fn(),
      handleSubmit: vi.fn().mockResolvedValue(true),
    });

    render(<SkillTypePage />);
    await user.click(
      screen.getByRole("button", { name: /crear tipo de habilidad/i }),
    );
    expect(screen.getByText("Procesando...")).toBeInTheDocument();
  });
});
