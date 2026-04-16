export interface UserPlant {
  id: string;
  userId: string;
  plantType: string;
  plantProfileId?: string;
  customName: string;
  notes?: string;
  tags: string[];
  scientificName?: string;
  lightNeeds?: string;
  wateringNeeds?: string;
  wateringFrequency?: string;
  lastWateredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPlantInput {
  plantType: string;
  plantProfileId?: string;
  customName: string;
  notes?: string;
  tags?: string[];
  scientificName?: string;
  lightNeeds?: string;
  wateringNeeds?: string;
  wateringFrequency?: string;
  lastWateredDate?: string;
}
