import { beforeEach, describe, expect, it, vi } from "vitest";
import { axiosClient } from "../../src/api/axiosClient";

vi.mock("../../src/api/axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const axiosMock = axiosClient as unknown as {
  get: vi.Mock;
  post: vi.Mock;
  delete: vi.Mock;
};

const labelMock = {
  id: 1,
  name: "Etiqueta",
  nameEng: "Label",
};

describe("labelProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    axiosMock.get.mockReset();
    axiosMock.post.mockReset();
    axiosMock.delete.mockReset();
  });

  const setupProvider = async () => import("../../src/api/labelProvider");

  it("fetches labels", async () => {
    const { getLabels } = await setupProvider();
    axiosMock.get.mockResolvedValueOnce({
      data: [labelMock],
    });

    const result = await getLabels();

    expect(result).toEqual([labelMock]);
    expect(axiosMock.get).toHaveBeenCalledWith("/label");
  });

  it("creates a label and returns the response status", async () => {
    const payload = { name: "Nuevo", nameEng: "New" };
    const { createLabel } = await setupProvider();
    axiosMock.post.mockResolvedValueOnce({
      data: labelMock,
      status: 201,
    });

    const result = await createLabel(payload);

    expect(result).toEqual({
      data: labelMock,
      status: 201,
    });
    expect(axiosMock.post).toHaveBeenCalledWith("/label", payload);
  });

  it("deletes a label using the provided id", async () => {
    const { deleteLabel } = await setupProvider();
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    const result = await deleteLabel(4200);

    expect(result).toEqual({ status: 204 });
    expect(axiosMock.delete).toHaveBeenCalledWith("/label/4200");
  });

  it("uses the base endpoint when no token is present", async () => {
    const { getLabels, createLabel, deleteLabel } = await setupProvider();
    axiosMock.get.mockResolvedValueOnce({
      data: [labelMock],
    });
    axiosMock.post.mockResolvedValueOnce({
      data: labelMock,
      status: 201,
    });
    axiosMock.delete.mockResolvedValueOnce({ status: 204 });

    await getLabels();
    await createLabel({ name: "Prueba", nameEng: "Test" });
    await deleteLabel(1);

    expect(axiosMock.get).toHaveBeenCalledWith("/label");
    expect(axiosMock.post).toHaveBeenCalledWith("/label", expect.any(Object));
    expect(axiosMock.delete).toHaveBeenCalledWith("/label/1");
  });
});
