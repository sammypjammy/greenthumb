export type PlantTaskType = "watering";
export type PlantTaskStatus = "open" | "completed";

export interface PlantTask {
  id: string;
  userId: string;
  plantId: string;
  type: PlantTaskType;
  title: string;
  dueDate: string;
  status: PlantTaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
