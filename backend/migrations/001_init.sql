-- Hand-written equivalent of schema.prisma, used ONLY to validate the data model
-- against a real Postgres instance in this sandbox (binaries.prisma.sh is blocked
-- here, so `prisma migrate dev` can't run). On the real machine, Prisma will
-- generate its own migration from schema.prisma directly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "UserSettings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"(id),
  theme TEXT NOT NULL DEFAULT 'light',
  "hydrationGoalMl" INT,
  "sleepGoalMinutes" INT
);

CREATE TABLE "SleepEntry" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  bedtime TIMESTAMP NOT NULL,
  "wakeTime" TIMESTAMP NOT NULL,
  "durationMinutes" INT NOT NULL,
  quality INT,
  feeling TEXT,
  date TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "SleepEntry" ("userId", date);

CREATE TABLE "WaterEntry" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "amountMl" INT NOT NULL,
  "loggedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "WaterEntry" ("userId", "loggedAt");

CREATE TABLE "MovementEntry" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "activityType" TEXT NOT NULL,
  "durationMinutes" INT NOT NULL,
  "loggedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "MovementEntry" ("userId", "loggedAt");

CREATE TABLE "NutritionEntry" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "mealType" TEXT NOT NULL,
  description TEXT NOT NULL,
  "loggedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "NutritionEntry" ("userId", "loggedAt");

CREATE TABLE "Account" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "Account" ("userId");

CREATE TABLE "TransactionCategory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("userId", name)
);

CREATE TABLE "Transaction" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "accountId" UUID NOT NULL REFERENCES "Account"(id),
  "categoryId" UUID REFERENCES "TransactionCategory"(id),
  type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  note TEXT,
  date TIMESTAMP NOT NULL,
  "transferToAccountId" UUID REFERENCES "Account"(id),
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "Transaction" ("userId", date);

CREATE TABLE "Habit" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "Habit" ("userId");

CREATE TABLE "HabitCompletion" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "habitId" UUID NOT NULL REFERENCES "Habit"(id),
  date TIMESTAMP NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("habitId", date)
);

CREATE TABLE "Goal" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  "progressPercent" INT NOT NULL DEFAULT 0,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "Goal" ("userId");

CREATE TABLE "GoalMilestone" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "goalId" UUID NOT NULL REFERENCES "Goal"(id),
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  "order" INT NOT NULL DEFAULT 0,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "GoalMilestone" ("goalId");

CREATE TABLE "Skill" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  "progressPercent" INT NOT NULL DEFAULT 0,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE ("userId", name)
);

CREATE TABLE "LearningSession" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "skillId" UUID REFERENCES "Skill"(id),
  topic TEXT NOT NULL,
  "durationMinutes" INT NOT NULL,
  "loggedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "LearningSession" ("userId", "loggedAt");

CREATE TABLE "Semester" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "Semester" ("userId");

CREATE TABLE "Course" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "semesterId" UUID NOT NULL REFERENCES "Semester"(id),
  name TEXT NOT NULL,
  code TEXT,
  "creditHours" INT,
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "Course" ("semesterId");

CREATE TABLE "CourseTask" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id),
  "clientId" TEXT UNIQUE NOT NULL,
  "courseId" UUID NOT NULL REFERENCES "Course"(id),
  description TEXT NOT NULL,
  deadline TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending',
  "deletedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX ON "CourseTask" ("courseId");
