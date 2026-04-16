import type { UserPlant, UserPlantInput } from "../types/userPlant";
import { UserDataStore, type UserDataRecord } from "./userDataStore";

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return Array.from(
    new Set(
      tags
        .map((tag) => String(tag || "").trim())
        .filter(Boolean),
    ),
  );
};

const generatePlantId = (): string => {
  const runtimeCrypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (runtimeCrypto?.randomUUID) {
    return runtimeCrypto.randomUUID();
  }

  return `plant_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const mapRecord = (plant: Partial<UserPlant> & { plantName?: string }, userId: string): UserPlant => {
  const now = new Date().toISOString();
  const customName = String(plant.customName || plant.plantName || "").trim();

  return {
    id: String(plant.id || generatePlantId()),
    userId,
    plantType: String(plant.plantType || "").trim(),
    plantProfileId: plant.plantProfileId ? String(plant.plantProfileId).trim() : undefined,
    customName,
    notes: plant.notes ? String(plant.notes).trim() : undefined,
    tags: normalizeTags(plant.tags),
    scientificName: plant.scientificName ? String(plant.scientificName).trim() : undefined,
    lightNeeds: plant.lightNeeds ? String(plant.lightNeeds).trim() : undefined,
    wateringNeeds: plant.wateringNeeds ? String(plant.wateringNeeds).trim() : undefined,
    wateringFrequency: plant.wateringFrequency ? String(plant.wateringFrequency).trim() : undefined,
    lastWateredDate: plant.lastWateredDate ? String(plant.lastWateredDate).trim() : undefined,
    createdAt: plant.createdAt || now,
    updatedAt: plant.updatedAt || now,
  };
};

const withStableUserRecord = (
  record: UserDataRecord<UserPlant>,
  plants: UserPlant[],
): UserDataRecord<UserPlant> => ({
  ...record,
  plants,
  careTasks: Array.isArray(record.careTasks) ? record.careTasks : [],
  reminders: Array.isArray(record.reminders) ? record.reminders : [],
  quizResults: Array.isArray(record.quizResults) ? record.quizResults : [],
  savedRecommendations: Array.isArray(record.savedRecommendations) ? record.savedRecommendations : [],
  preferences: record.preferences && typeof record.preferences === "object" ? record.preferences : {},
  meta: {
    legacyPlantsMigrated: Boolean(record.meta?.legacyPlantsMigrated),
  },
});

export class PlantService {
  constructor(private readonly store = new UserDataStore<UserPlant>()) {}

  private requireUserId(userId: string): void {
    if (!userId) {
      throw new Error("A signed-in user is required.");
    }
  }

  async listPlants(userId: string): Promise<UserPlant[]> {
    this.requireUserId(userId);
    const record = this.store.getRecord(userId, true);
    if (!record) {
      return [];
    }

    // Query-level ownership filter: even malformed persisted data cannot leak across users.
    return this.normalizeScopedPlants(record, userId);
  }

  private normalizeScopedPlants(record: UserDataRecord<UserPlant>, userId: string): UserPlant[] {
    return record.plants
      .filter((plant) => !plant.userId || plant.userId === userId)
      .map((plant) => mapRecord(plant, userId));
  }

  async createPlant(userId: string, input: UserPlantInput): Promise<UserPlant> {
    this.requireUserId(userId);
    const now = new Date().toISOString();
    const plant = mapRecord(
      {
        ...input,
        id: generatePlantId(),
        userId,
        createdAt: now,
        updatedAt: now,
      },
      userId,
    );

    this.store.updateRecord(userId, (record) =>
      withStableUserRecord(record, [plant, ...this.normalizeScopedPlants(record, userId)]),
    );

    return plant;
  }

  async updatePlant(userId: string, plantId: string, input: Partial<UserPlantInput>): Promise<UserPlant> {
    this.requireUserId(userId);
    let updatedPlant: UserPlant | null = null;

    this.store.updateRecord(userId, (record) => {
      const scopedPlants = this.normalizeScopedPlants(record, userId);
      const nextPlants = scopedPlants.map((plant) => {
        if (plant.id !== plantId) {
          return plant;
        }

        updatedPlant = mapRecord(
          {
            ...plant,
            ...input,
            customName: input.customName ?? plant.customName,
            updatedAt: new Date().toISOString(),
          },
          userId,
        );
        return updatedPlant;
      });

      return withStableUserRecord(record, nextPlants);
    });

    if (!updatedPlant) {
      throw new Error("Plant not found for this user.");
    }

    return updatedPlant;
  }

  async deletePlant(userId: string, plantId: string): Promise<void> {
    this.requireUserId(userId);
    this.store.updateRecord(userId, (record) => {
      const scopedPlants = this.normalizeScopedPlants(record, userId);
      const nextPlants = scopedPlants.filter((plant) => plant.id !== plantId);

      if (nextPlants.length === scopedPlants.length) {
        throw new Error("Plant not found for this user.");
      }

      return withStableUserRecord(record, nextPlants);
    });
  }
}

export const plantService = new PlantService();
