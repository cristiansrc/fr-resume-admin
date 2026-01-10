import type { SkillSonResponse } from "../skill-son/SkillSonResponse";

export interface ExperienceResponse {
  id: number;
  yearStart: string;
  yearEnd: string;
  company: string;
  location: string;
  locationEng: string;
  position: string;
  positionEng: string;
  summary: string;
  summaryEng: string;
  summaryPdf: string;
  summaryPdfEng: string;
  descriptionItemsPdf: string[];
  descriptionItemsPdfEng: string[];
  skillSons: SkillSonResponse[];
}
