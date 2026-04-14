import type {
  Difficulty,
  HumidityNeed,
  LightNeed,
  Plant,
  WateringNeed,
} from "../types";

export const LIGHT_NEED_LABELS = {
  low: "Low light",
  medium: "Medium light",
  bright_indirect: "Bright indirect light",
  direct_sun: "Direct sun",
} as const satisfies Record<LightNeed, string>;

export const WATERING_NEED_LABELS = {
  weekly: "Water weekly",
  biweekly: "Water every 2 weeks",
  when_top_1_inch_dry: "Water when top inch of soil is dry",
  when_half_dry: "Water when soil is about halfway dry",
  when_fully_dry: "Water when soil is fully dry",
} as const satisfies Record<WateringNeed, string>;

export const HUMIDITY_NEED_LABELS = {
  low: "Low humidity",
  average: "Average humidity",
  high: "High humidity",
} as const satisfies Record<HumidityNeed, string>;

export const DIFFICULTY_LABELS = {
  easy: "Easy",
  moderate: "Moderate",
  advanced: "Advanced",
} as const satisfies Record<Difficulty, string>;

export const PET_SAFE_LABELS = {
  true: "Pet safe",
  false: "Not pet safe",
} as const;

export const getLightNeedLabel = (value: LightNeed): string => LIGHT_NEED_LABELS[value];

export const getWateringNeedLabel = (value: WateringNeed): string =>
  WATERING_NEED_LABELS[value];

export const getHumidityNeedLabel = (value: HumidityNeed): string =>
  HUMIDITY_NEED_LABELS[value];

export const getDifficultyLabel = (value: Difficulty): string => DIFFICULTY_LABELS[value];

export const getPetSafeLabel = (petSafe: boolean): string =>
  PET_SAFE_LABELS[petSafe ? "true" : "false"];

export const getPlantDisplayLabels = (plant: Plant) => ({
  lightNeed: getLightNeedLabel(plant.lightNeed),
  wateringNeed: getWateringNeedLabel(plant.wateringNeed),
  humidityNeed: getHumidityNeedLabel(plant.humidityNeed),
  difficulty: getDifficultyLabel(plant.difficulty),
  petSafe: getPetSafeLabel(plant.petSafe),
});
