import type { SkillResponse } from "../skill/SkillResponse";

export interface SkillTypeResponse {
  id: number;
  name: string;
  nameEng: string;
  skills: SkillResponse[];
}
