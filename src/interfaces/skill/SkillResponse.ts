import type { SkillSonResponse } from "../skill-son/SkillSonResponse";

export interface SkillResponse {
  id: number;
  name: string;
  nameEng: string;
  skillSons: SkillSonResponse[];
}
