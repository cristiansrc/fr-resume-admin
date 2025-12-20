export type SocialField = "instagram" | "linkedin" | "x" | "github";

type SocialConfig = {
  base: string;
  allowedPrefixes: string[];
  hint: string;
};

export const SOCIAL_FIELD_CONFIG: Record<SocialField, SocialConfig> = {
  instagram: {
    base: "https://instagram.com/",
    allowedPrefixes: [
      "https://instagram.com/",
      "https://www.instagram.com/",
      "https://instagram.com",
      "https://www.instagram.com",
      "http://instagram.com/",
      "http://www.instagram.com/",
      "http://instagram.com",
      "http://www.instagram.com",
    ],
    hint: "instagram.com",
  },
  linkedin: {
    base: "https://www.linkedin.com/in/",
    allowedPrefixes: [
      "https://www.linkedin.com/in/",
      "https://linkedin.com/in/",
      "https://www.linkedin.com/",
      "https://linkedin.com/",
      "https://www.linkedin.com",
      "https://linkedin.com",
      "http://www.linkedin.com/in/",
      "http://linkedin.com/in/",
      "http://www.linkedin.com/",
      "http://linkedin.com/",
    ],
    hint: "linkedin.com",
  },
  x: {
    base: "https://x.com/",
    allowedPrefixes: [
      "https://x.com/",
      "https://www.x.com/",
      "https://x.com",
      "https://www.x.com",
      "http://x.com/",
      "http://www.x.com/",
      "http://x.com",
      "http://www.x.com",
    ],
    hint: "x.com",
  },
  github: {
    base: "https://github.com/",
    allowedPrefixes: [
      "https://github.com/",
      "https://www.github.com/",
      "https://github.com",
      "https://www.github.com",
      "http://github.com/",
      "http://www.github.com/",
      "http://github.com",
      "http://www.github.com",
    ],
    hint: "github.com",
  },
};

export const SOCIAL_LABELS: Record<SocialField, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  github: "GitHub",
};

export const SOCIAL_FIELDS: SocialField[] = [
  "instagram",
  "linkedin",
  "x",
  "github",
];

const sanitizeSocialValue = (
  value: string | undefined,
  config: SocialConfig,
): string => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const lowerTrimmed = trimmed.toLowerCase();

  if (lowerTrimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }

  const hostWithSlash = config.base.replace(/^https?:\/\//, "");
  const hostWithoutSlash = hostWithSlash.replace(/\/$/, "");

  if (
    lowerTrimmed === hostWithoutSlash ||
    lowerTrimmed.startsWith(`${hostWithoutSlash}/`) ||
    lowerTrimmed.startsWith(hostWithSlash)
  ) {
    return `https://${trimmed}`;
  }

  return `${config.base}${trimmed.replace(/^\/+/, "")}`;
};

export const validateSocialField = (
  value: string | undefined,
  config: SocialConfig,
): Promise<void> => {
  if (!value?.trim()) {
    return Promise.resolve();
  }

  const normalized = sanitizeSocialValue(value, config);
  const normalizedLower = normalized.toLowerCase();

  if (!/^https?:\/\//i.test(normalized)) {
    return Promise.reject(new Error("El valor debe tener http(s) al inicio"));
  }

  const hasValidPrefix = config.allowedPrefixes.some((prefix) =>
    normalizedLower.startsWith(prefix),
  );

  if (!hasValidPrefix) {
    return Promise.reject(
      new Error(`La URL debe comenzar con ${config.hint}`),
    );
  }

  return Promise.resolve();
};

export const normalizeSocialValue = (
  value: string | undefined,
  config: SocialConfig,
) => sanitizeSocialValue(value, config);
