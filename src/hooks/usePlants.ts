import { useCallback, useEffect, useState } from "react";
import { plantService } from "../services/plantService";
import type { UserPlant, UserPlantInput } from "../types";

export const usePlants = (userId: string | null) => {
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requireUserId = useCallback(() => {
    if (!userId) {
      throw new Error("A signed-in user is required.");
    }
    return userId;
  }, [userId]);

  const reloadPlants = useCallback(async () => {
    if (!userId) {
      setPlants([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setPlants(await plantService.listPlants(userId));
    } catch (plantError) {
      const message = plantError instanceof Error ? plantError.message : "Unable to load plants.";
      setError(message);
      setPlants([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createPlant = useCallback(
    async (input: UserPlantInput) => {
      const activeUserId = requireUserId();
      const createdPlant = await plantService.createPlant(activeUserId, input);
      setPlants((currentPlants) => [createdPlant, ...currentPlants]);
      return createdPlant;
    },
    [requireUserId],
  );

  const updatePlant = useCallback(
    async (plantId: string, input: Partial<UserPlantInput>) => {
      const activeUserId = requireUserId();
      const updatedPlant = await plantService.updatePlant(activeUserId, plantId, input);
      setPlants((currentPlants) =>
        currentPlants.map((plant) => (plant.id === updatedPlant.id ? updatedPlant : plant)),
      );
      return updatedPlant;
    },
    [requireUserId],
  );

  const deletePlant = useCallback(
    async (plantId: string) => {
      const activeUserId = requireUserId();
      await plantService.deletePlant(activeUserId, plantId);
      setPlants((currentPlants) => currentPlants.filter((plant) => plant.id !== plantId));
    },
    [requireUserId],
  );

  useEffect(() => {
    void reloadPlants();
  }, [reloadPlants]);

  return {
    plants,
    isLoading,
    error,
    reloadPlants,
    createPlant,
    updatePlant,
    deletePlant,
  };
};
