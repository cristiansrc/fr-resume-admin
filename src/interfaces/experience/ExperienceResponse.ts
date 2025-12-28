import type { SkillSonResponse } from "../skill-son/SkillSonResponse";

export interface ExperienceResponse {
  id: number;
  yearStart: string;
  yearEnd: string;
  company: string;
  description: string;
  descriptionEng: string;
  skillSons: SkillSonResponse[];
}
