-- Create user table for persisted roles
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "email" TEXT,
  "roles" TEXT[] NOT NULL DEFAULT ARRAY['member']::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
