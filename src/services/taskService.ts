import type { PlantTask } from "../types/plantTask";
import type { UserPlant } from "../types/userPlant";
import { UserDataStore, type UserDataRecord } from "./userDataStore";

export const UPCOMING_TASK_WINDOW_DAYS = 3;

const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const parseDateOnly = (dateValue?: string): Date => {
  const parsedDate = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const getStartOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getDayDifferenceFromToday = (dateValue: string): number => {
  const dueDate = parseDateOnly(dateValue);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dueDate.getTime() - getStartOfToday().getTime()) / millisecondsPerDay);
};

const generateTaskId = (): string =>
  `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const getNextWateringDueDate = (plant: UserPlant): string => {
  const frequency = Number.parseInt(plant.wateringFrequency || "7", 10);
  const safeFrequency = Number.isFinite(frequency) && frequency > 0 ? frequency : 7;
  return formatDateOnly(addDays(parseDateOnly(plant.lastWateredDate), safeFrequency));
};

const shouldCreateWateringTaskForPlant = (plant: UserPlant): boolean =>
  getDayDifferenceFromToday(getNextWateringDueDate(plant)) <= 0;

const normalizeTask = (task: Partial<PlantTask>, userId: string): PlantTask => {
  const now = new Date().toISOString();
  return {
    id: String(task.id || generateTaskId()),
    userId,
    plantId: String(task.plantId || ""),
    type: "watering",
    title: String(task.title || "Water plant"),
    dueDate: String(task.dueDate || formatDateOnly(new Date())),
    status: task.status === "completed" ? "completed" : "open",
    completedAt: task.completedAt || null,
    createdAt: task.createdAt || now,
    updatedAt: task.updatedAt || now,
  };
};

const withTasks = (
  record: UserDataRecord<UserPlant>,
  careTasks: PlantTask[],
): UserDataRecord<UserPlant> => ({
  ...record,
  plants: Array.isArray(record.plants) ? record.plants : [],
  careTasks,
  reminders: Array.isArray(record.reminders) ? record.reminders : [],
  quizResults: Array.isArray(record.quizResults) ? record.quizResults : [],
  savedRecommendations: Array.isArray(record.savedRecommendations) ? record.savedRecommendations : [],
  preferences: record.preferences && typeof record.preferences === "object" ? record.preferences : {},
  meta: {
    legacyPlantsMigrated: Boolean(record.meta?.legacyPlantsMigrated),
  },
});

export class TaskService {
  constructor(private readonly store = new UserDataStore<UserPlant>()) {}

  listTasks(userId: string): PlantTask[] {
    const record = this.store.getRecord(userId, true);
    return record ? this.normalizeTasks(record, userId) : [];
  }

  listVisibleTasks(userId: string): PlantTask[] {
    return this.getVisibleTasks(this.listTasks(userId));
  }

  getVisibleTasks(tasks: PlantTask[]): PlantTask[] {
    return tasks
      .filter((task) => task.status === "open" && getDayDifferenceFromToday(task.dueDate) <= UPCOMING_TASK_WINDOW_DAYS)
      .sort((a, b) => parseDateOnly(a.dueDate).getTime() - parseDateOnly(b.dueDate).getTime());
  }

  reconcileWateringTasks(userId: string, plants: UserPlant[]): PlantTask[] {
    const plantIds = new Set(plants.map((plant) => plant.id));
    const tasks = this.listTasks(userId).filter((task) => plantIds.has(task.plantId));

    plants.forEach((plant) => {
      const hasOpenTask = tasks.some(
        (task) => task.plantId === plant.id && task.type === "watering" && task.status === "open",
      );
      if (!hasOpenTask && shouldCreateWateringTaskForPlant(plant)) {
        tasks.push(this.createWateringTask(userId, plant));
      }
    });

    this.store.updateRecord(userId, (record) => withTasks(record, tasks));
    return tasks;
  }

  completeTask(userId: string, taskId: string): PlantTask {
    let completedTask: PlantTask | null = null;
    this.store.updateRecord(userId, (record) => {
      const now = new Date().toISOString();
      const today = formatDateOnly(new Date());
      const tasks = this.normalizeTasks(record, userId).map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        completedTask = normalizeTask(
          {
            ...task,
            status: "completed",
            completedAt: now,
            updatedAt: now,
          },
          userId,
        );
        return completedTask;
      });

      if (!completedTask) {
        return withTasks(record, tasks);
      }

      const plants = record.plants.map((plant) => {
        if (plant.id !== completedTask?.plantId || completedTask.type !== "watering") {
          return plant;
        }
        return {
          ...plant,
          lastWateredDate: today,
          updatedAt: now,
        };
      });
      return {
        ...withTasks(record, tasks),
        plants,
      };
    });

    if (!completedTask) {
      throw new Error("Task not found for this user.");
    }
    return completedTask;
  }

  completeOpenWateringTaskForPlant(userId: string, plantId: string): boolean {
    let completedAnyTask = false;
    this.store.updateRecord(userId, (record) => {
      const now = new Date().toISOString();
      const today = formatDateOnly(new Date());
      const tasks = this.normalizeTasks(record, userId).map((task) => {
        if (task.plantId !== plantId || task.type !== "watering" || task.status === "completed") {
          return task;
        }
        completedAnyTask = true;
        return normalizeTask(
          {
            ...task,
            status: "completed",
            completedAt: now,
            updatedAt: now,
          },
          userId,
        );
      });

      const plants = record.plants.map((plant) =>
        plant.id === plantId
          ? {
              ...plant,
              lastWateredDate: today,
              updatedAt: now,
            }
          : plant,
      );
      const updatedPlant = plants.find((plant) => plant.id === plantId);
      if (!updatedPlant) {
        throw new Error("Plant not found for this user.");
      }

      const nextTasks = tasks.filter(
        (task) => !(task.plantId === plantId && task.type === "watering" && task.status === "open"),
      );

      return {
        ...withTasks(record, nextTasks),
        plants,
      };
    });

    return completedAnyTask;
  }

  private normalizeTasks(record: UserDataRecord<UserPlant>, userId: string): PlantTask[] {
    const tasks = Array.isArray(record.careTasks) ? record.careTasks : [];
    return tasks
      .map((task) => normalizeTask(task as Partial<PlantTask>, userId))
      .filter((task) => task.userId === userId);
  }

  private createWateringTask(userId: string, plant: UserPlant): PlantTask {
    return normalizeTask(
      {
        id: generateTaskId(),
        userId,
        plantId: plant.id,
        type: "watering",
        title: `Water ${plant.customName}`,
        dueDate: getNextWateringDueDate(plant),
      },
      userId,
    );
  }
}

export const taskService = new TaskService();
