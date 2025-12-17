import { describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import type { MutableRefObject } from "react";

import {
  sanitizeSocialValue,
  validateSocialField,
  isDateOutOfSelectableRange,
  getFieldValue,
  buildBasicDataPayload,
} from "../../../src/pages/home/BasicDataForm";
import type { BasicDataFormValues } from "../../../src/pages/home/BasicDataForm";
import { runBasicDataLoaderIfNeeded } from "../../../src/pages/home/BasicDataForm";

describe("basic data helpers", () => {
  it("sanitizes social links correctly", () => {
    expect(
      sanitizeSocialValue("  x.com/profile  ", {
        base: "https://x.com/",
        allowedPrefixes: [],
        hint: "x.com",
      }),
    ).toBe("https://x.com/profile");
    expect(
      sanitizeSocialValue("http://github.com/test", {
        base: "https://github.com/",
        allowedPrefixes: [],
        hint: "github.com",
      }),
    ).toBe("http://github.com/test");
    expect(
      sanitizeSocialValue("www.instagram.com/yo", {
        base: "https://instagram.com/",
        allowedPrefixes: [],
        hint: "instagram.com",
      }),
    ).toBe("https://www.instagram.com/yo");
    expect(
      sanitizeSocialValue("instagram.com", {
        base: "https://instagram.com/",
        allowedPrefixes: [],
        hint: "instagram.com",
      }),
    ).toBe("https://instagram.com");
    expect(
      sanitizeSocialValue("   ", {
        base: "",
        allowedPrefixes: [],
        hint: "",
      }),
    ).toBe("");
    expect(
      sanitizeSocialValue(undefined, {
        base: "",
        allowedPrefixes: [],
        hint: "",
      }),
    ).toBe("");
    expect(
      sanitizeSocialValue("usuario", {
        base: "https://github.com/",
        allowedPrefixes: [],
        hint: "github.com",
      }),
    ).toBe("https://github.com/usuario");
  });

  it("validates social inputs and rejects invalid values", async () => {
    await expect(
      validateSocialField("https://www.x.com/test", {
        base: "https://x.com/",
        allowedPrefixes: ["https://x.com/", "https://www.x.com/"],
        hint: "x.com",
      }),
    ).resolves.toBeUndefined();

    await expect(
      validateSocialField("sin-http.com/profile", {
        base: "",
        allowedPrefixes: [],
        hint: "x.com",
      }),
    ).rejects.toThrow();

    await expect(
      validateSocialField("   ", {
        base: "",
        allowedPrefixes: [],
        hint: "x.com",
      }),
    ).resolves.toBeUndefined();

    await expect(
      validateSocialField("usuario", {
        base: "github.com/",
        allowedPrefixes: [],
        hint: "github.com",
      }),
    ).rejects.toThrow(/http\(s\)/i);

    await expect(
      validateSocialField("https://notvalid.com/test", {
        base: "",
        allowedPrefixes: ["https://x.com/", "https://www.x.com/"],
        hint: "x.com",
      }),
    ).rejects.toThrow(/x.com/);
  });

  it("flags dates outside the selectable range", () => {
    expect(isDateOutOfSelectableRange()).toBe(false);
    expect(isDateOutOfSelectableRange(dayjs("1969-12-31"))).toBe(true);
    expect(isDateOutOfSelectableRange(dayjs("1975-01-01"))).toBe(false);
    expect(isDateOutOfSelectableRange(dayjs().add(1, "day"))).toBe(true);
  });

  it("trims text before returning and returns empty string for missing value", () => {
    expect(getFieldValue("  texto  ")).toBe("texto");
    expect(getFieldValue(undefined)).toBe("");
    expect(getFieldValue("")).toBe("");
  });

  it("builds payload with empty values for missing dates and sanitized fields", () => {
    const values: BasicDataFormValues = {
      firstName: " Juan ",
      othersName: undefined,
      firstSurName: " Pérez ",
      othersSurName: undefined,
      dateBirth: undefined,
      located: " Bogotá ",
      locatedEng: " Bogota ",
      startWorkingDate: undefined,
      greeting: " Hola ",
      greetingEng: " Hello ",
      email: " correo@example.com ",
      instagram: "instagram.com/usuario",
      linkedin: undefined,
      x: undefined,
      github: undefined,
      description: " Descripción ",
      descriptionEng: " Description ",
    };

    const payload = buildBasicDataPayload(values);

    expect(payload.firstName).toBe("Juan");
    expect(payload.dateBirth).toBe("");
    expect(payload.startWorkingDate).toBe("");
    expect(payload.instagram).toBe("https://instagram.com/usuario");
    expect(payload.linkedin).toBe("");
  });

  it("uses the loader helper to skip duplicate load attempts", () => {
    const loadFn = vi.fn(() => Promise.resolve());
    const loadedRef = { current: true } as MutableRefObject<boolean>;

    runBasicDataLoaderIfNeeded(loadedRef, loadFn);

    expect(loadFn).not.toHaveBeenCalled();
  });

  it("marks the ref and triggers the loader when needed", () => {
    const loadFn = vi.fn(() => Promise.resolve());
    const loadedRef = { current: false } as MutableRefObject<boolean>;

    runBasicDataLoaderIfNeeded(loadedRef, loadFn);

    expect(loadFn).toHaveBeenCalledTimes(1);
    expect(loadedRef.current).toBe(true);
  });
});
