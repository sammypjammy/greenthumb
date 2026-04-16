export interface UserDataRecord<TPlant = unknown, TTask = unknown> {
  plants: TPlant[];
  careTasks: TTask[];
  reminders: unknown[];
  quizResults: unknown[];
  savedRecommendations: unknown[];
  preferences: Record<string, unknown>;
  meta: {
    legacyPlantsMigrated: boolean;
  };
}

const USER_DATA_STORAGE_KEY = "greenThumbUserData";

interface SyncStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const getDefaultStorage = (): SyncStorage => {
  const runtimeStorage = (globalThis as { localStorage?: SyncStorage }).localStorage;
  if (!runtimeStorage) {
    throw new Error("No persistent storage provider is available.");
  }
  return runtimeStorage;
};

const createDefaultUserDataRecord = <TPlant, TTask>(): UserDataRecord<TPlant, TTask> => ({
  plants: [],
  careTasks: [],
  reminders: [],
  quizResults: [],
  savedRecommendations: [],
  preferences: {},
  meta: {
    legacyPlantsMigrated: false,
  },
});

const readJSON = <T>(storage: SyncStorage, key: string, fallbackValue: T): T => {
  const rawValue = storage.getItem(key);
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallbackValue;
  }
};

const writeJSON = <T>(storage: SyncStorage, key: string, value: T): void => {
  storage.setItem(key, JSON.stringify(value));
};

export class UserDataStore<TPlant = unknown> {
  constructor(private readonly storage: SyncStorage = getDefaultStorage()) {}

  getRecord(userId: string, shouldCreate = true): UserDataRecord<TPlant> | null {
    if (!userId) {
      return null;
    }

    const store = readJSON<Record<string, UserDataRecord<TPlant>>>(this.storage, USER_DATA_STORAGE_KEY, {});
    if (!store[userId] && shouldCreate) {
      store[userId] = createDefaultUserDataRecord<TPlant, unknown>();
      writeJSON(this.storage, USER_DATA_STORAGE_KEY, store);
    }

    return store[userId] ?? null;
  }

  updateRecord(
    userId: string,
    updater: (record: UserDataRecord<TPlant>) => UserDataRecord<TPlant>,
  ): UserDataRecord<TPlant> {
    if (!userId) {
      throw new Error("A signed-in user is required.");
    }

    const store = readJSON<Record<string, UserDataRecord<TPlant>>>(this.storage, USER_DATA_STORAGE_KEY, {});
    const currentRecord = store[userId] ?? createDefaultUserDataRecord<TPlant, unknown>();
    const nextRecord = updater(currentRecord);
    store[userId] = nextRecord;
    writeJSON(this.storage, USER_DATA_STORAGE_KEY, store);
    return nextRecord;
  }
}
