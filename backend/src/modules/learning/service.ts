import { insertEntity, listEntities, updateEntity, softDeleteEntity } from "../../lib/syncableEntity";

export const createSkill = (userId: string, input: { clientId: string; name: string; progressPercent?: number }) =>
  insertEntity("Skill", userId, input.clientId, {
    name: input.name,
    progressPercent: input.progressPercent ?? 0,
  });

export const listSkills = (userId: string) => listEntities("Skill", userId, { orderBy: "name" });
export const updateSkillProgress = (userId: string, clientId: string, progressPercent: number) =>
  updateEntity("Skill", userId, clientId, { progressPercent });
export const deleteSkill = (userId: string, clientId: string) => softDeleteEntity("Skill", userId, clientId);

export const createLearningSession = (
  userId: string,
  input: { clientId: string; skillId?: string; topic: string; durationMinutes: number; loggedAt: string }
) =>
  insertEntity("LearningSession", userId, input.clientId, {
    skillId: input.skillId ?? null,
    topic: input.topic,
    durationMinutes: input.durationMinutes,
    loggedAt: input.loggedAt,
  });

export const listLearningSessions = (userId: string) =>
  listEntities("LearningSession", userId, { orderBy: "loggedAt" });
export const deleteLearningSession = (userId: string, clientId: string) =>
  softDeleteEntity("LearningSession", userId, clientId);
