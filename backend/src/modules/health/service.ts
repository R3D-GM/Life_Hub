import { insertEntity, updateEntity, softDeleteEntity, listEntities } from "../../lib/syncableEntity";

function sleepDurationMinutes(bedtime: string, wakeTime: string) {
  const start = new Date(bedtime).getTime();
  let end = new Date(wakeTime).getTime();
  if (end <= start) {
    // wake time is "next day" relative to bedtime
    end += 24 * 60 * 60 * 1000;
  }
  return Math.round((end - start) / 60000);
}

export async function createSleepEntry(userId: string, input: {
  clientId: string; bedtime: string; wakeTime: string; quality?: number; feeling?: string; date: string;
}) {
  const durationMinutes = sleepDurationMinutes(input.bedtime, input.wakeTime);
  return insertEntity("SleepEntry", userId, input.clientId, {
    bedtime: input.bedtime,
    wakeTime: input.wakeTime,
    durationMinutes,
    quality: input.quality ?? null,
    feeling: input.feeling ?? null,
    date: input.date,
  });
}

export const listSleep = (userId: string) => listEntities("SleepEntry", userId, { orderBy: "date" });
export const updateSleep = (userId: string, clientId: string, fields: Record<string, unknown>) =>
  updateEntity("SleepEntry", userId, clientId, fields);
export const deleteSleep = (userId: string, clientId: string) =>
  softDeleteEntity("SleepEntry", userId, clientId);

export const createWater = (userId: string, input: { clientId: string; amountMl: number; loggedAt: string }) =>
  insertEntity("WaterEntry", userId, input.clientId, { amountMl: input.amountMl, loggedAt: input.loggedAt });
export const listWater = (userId: string) => listEntities("WaterEntry", userId, { orderBy: "loggedAt" });
export const deleteWater = (userId: string, clientId: string) => softDeleteEntity("WaterEntry", userId, clientId);

export const createMovement = (
  userId: string,
  input: { clientId: string; activityType: string; durationMinutes: number; loggedAt: string }
) =>
  insertEntity("MovementEntry", userId, input.clientId, {
    activityType: input.activityType,
    durationMinutes: input.durationMinutes,
    loggedAt: input.loggedAt,
  });
export const listMovement = (userId: string) => listEntities("MovementEntry", userId, { orderBy: "loggedAt" });
export const deleteMovement = (userId: string, clientId: string) =>
  softDeleteEntity("MovementEntry", userId, clientId);

export const createNutrition = (
  userId: string,
  input: { clientId: string; mealType: string; description: string; loggedAt: string }
) =>
  insertEntity("NutritionEntry", userId, input.clientId, {
    mealType: input.mealType,
    description: input.description,
    loggedAt: input.loggedAt,
  });
export const listNutrition = (userId: string) => listEntities("NutritionEntry", userId, { orderBy: "loggedAt" });
export const deleteNutrition = (userId: string, clientId: string) =>
  softDeleteEntity("NutritionEntry", userId, clientId);
