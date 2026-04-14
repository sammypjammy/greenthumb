export type LightNeed = "low" | "medium" | "bright_indirect" | "direct_sun";

export type WateringNeed =
  | "weekly"
  | "biweekly"
  | "when_top_1_inch_dry"
  | "when_half_dry"
  | "when_fully_dry";

export type HumidityNeed = "low" | "average" | "high";

export type Difficulty = "easy" | "moderate" | "advanced";

export interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  lightNeed: LightNeed;
  wateringNeed: WateringNeed;
  humidityNeed: HumidityNeed;
  difficulty: Difficulty;
  petSafe: boolean;
  shortDescription: string;
}
