import { useCallback, useEffect, useState } from "react";
import { taskService } from "../services/taskService";
import type { PlantTask, UserPlant } from "../types";

export const useCareTasks = (userId: string | null, plants: UserPlant[]) => {
  const [tasks, setTasks] = useState<PlantTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadTasks = useCallback(() => {
    if (!userId) {
      setTasks([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      taskService.reconcileWateringTasks(userId, plants);
      setTasks(taskService.listVisibleTasks(userId));
    } catch (taskError) {
      const message = taskError instanceof Error ? taskError.message : "Unable to load care tasks.";
      setError(message);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [plants, userId]);

  const completeTask = useCallback(
    (taskId: string) => {
      if (!userId) {
        throw new Error("A signed-in user is required.");
      }
      const completedTask = taskService.completeTask(userId, taskId);
      setTasks(taskService.listVisibleTasks(userId));
      return completedTask;
    },
    [userId],
  );

  useEffect(() => {
    reloadTasks();
  }, [reloadTasks]);

  return {
    tasks,
    isLoading,
    error,
    reloadTasks,
    completeTask,
  };
};
