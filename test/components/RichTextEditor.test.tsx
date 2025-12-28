import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "../../src/components/RichTextEditor";

const useEditorMock = vi.fn();
const placeholderConfigureMock = vi.fn();

vi.mock("antd", () => ({
  Button: ({ children, onClick, type, ...props }: any) => (
    <button onClick={onClick} data-type={type} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@tiptap/react", () => ({
  EditorContent: ({ editor }: { editor: unknown }) => (
    <div data-testid="editor-content" data-has-editor={Boolean(editor)} />
  ),
  useEditor: (...args: unknown[]) => useEditorMock(...args),
}));

vi.mock("@tiptap/extension-placeholder", () => ({
  default: {
    configure: (...args: unknown[]) => placeholderConfigureMock(...args),
  },
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: { name: "starter-kit" },
}));

const buildEditor = () => {
  const chain = {
    focus: vi.fn(() => chain),
    toggleBold: vi.fn(() => chain),
    toggleItalic: vi.fn(() => chain),
    toggleStrike: vi.fn(() => chain),
    toggleBulletList: vi.fn(() => chain),
    toggleOrderedList: vi.fn(() => chain),
    undo: vi.fn(() => chain),
    redo: vi.fn(() => chain),
    run: vi.fn(),
  };

  return {
    isActive: vi.fn(() => false),
    chain: vi.fn(() => chain),
    getHTML: vi.fn(() => "<p>content</p>"),
    commands: {
      setContent: vi.fn(),
    },
    chainInstance: chain,
  };
};

describe("RichTextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when editor is not ready", () => {
    useEditorMock.mockReturnValueOnce(null);

    const { container } = render(<RichTextEditor />);

    expect(container.firstChild).toBeNull();
  });

  it("renders the toolbar and calls editor commands", async () => {
    const editor = buildEditor();
    useEditorMock.mockReturnValueOnce(editor);

    render(<RichTextEditor />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Negrita"));
    await user.click(screen.getByLabelText("Cursiva"));
    await user.click(screen.getByLabelText("Tachado"));
    await user.click(screen.getByLabelText("Lista con viñetas"));
    await user.click(screen.getByLabelText("Lista numerada"));
    await user.click(screen.getByLabelText("Deshacer"));
    await user.click(screen.getByLabelText("Rehacer"));

    expect(editor.chain).toHaveBeenCalled();
    expect(editor.chainInstance.toggleBold).toHaveBeenCalled();
    expect(editor.chainInstance.toggleItalic).toHaveBeenCalled();
    expect(editor.chainInstance.toggleStrike).toHaveBeenCalled();
    expect(editor.chainInstance.toggleBulletList).toHaveBeenCalled();
    expect(editor.chainInstance.toggleOrderedList).toHaveBeenCalled();
    expect(editor.chainInstance.undo).toHaveBeenCalled();
    expect(editor.chainInstance.redo).toHaveBeenCalled();
    expect(editor.chainInstance.run).toHaveBeenCalled();
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("calls onChange with the editor html on update", () => {
    const editor = buildEditor();
    const onChange = vi.fn();
    useEditorMock.mockImplementationOnce((options: { onUpdate?: Function }) => {
      options.onUpdate?.({ editor });
      return editor;
    });

    render(<RichTextEditor onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith("<p>content</p>");
  });

  it("syncs external value when it differs", async () => {
    const editor = buildEditor();
    editor.getHTML = vi.fn(() => "<p>old</p>");
    useEditorMock.mockReturnValueOnce(editor);

    render(<RichTextEditor value="<p>new</p>" />);

    await waitFor(() =>
      expect(editor.commands.setContent).toHaveBeenCalledWith("<p>new</p>", false),
    );
  });

  it("does not set content when external value matches", async () => {
    const editor = buildEditor();
    editor.getHTML = vi.fn(() => "<p>same</p>");
    useEditorMock.mockReturnValueOnce(editor);

    render(<RichTextEditor value="<p>same</p>" />);

    await waitFor(() =>
      expect(editor.commands.setContent).not.toHaveBeenCalled(),
    );
  });

  it("marks toolbar buttons as active", () => {
    const editor = buildEditor();
    editor.isActive = vi.fn((name: string) => name === "bold" || name === "italic");
    useEditorMock.mockReturnValueOnce(editor);

    render(<RichTextEditor />);

    expect(screen.getByLabelText("Negrita")).toHaveAttribute("data-type", "primary");
    expect(screen.getByLabelText("Cursiva")).toHaveAttribute("data-type", "primary");
    expect(screen.getByLabelText("Tachado")).toHaveAttribute("data-type", "text");
  });

  it("configures placeholder with the provided text", () => {
    const editor = buildEditor();
    useEditorMock.mockReturnValueOnce(editor);

    render(<RichTextEditor placeholder="Escribe algo" />);

    expect(placeholderConfigureMock).toHaveBeenCalledWith({
      placeholder: "Escribe algo",
    });
  });
});
