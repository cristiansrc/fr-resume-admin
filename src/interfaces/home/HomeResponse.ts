import type { ImageResponse } from "../image/ImageResponse";
import type { LabelResponse } from "../label/LabelResponse";

export interface HomeResponse {
  id: number;
  greeting: string;
  greetingEng: string;
  imageUrl: ImageResponse;
  buttonWorkLabel: string;
  buttonWorkLabelEng: string;
  buttonContactLabel: string;
  buttonContactLabelEng: string;
  labels: LabelResponse[];
}
