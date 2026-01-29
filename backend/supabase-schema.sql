-- Session participant invites
CREATE TABLE "SessionParticipantInvite" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SessionParticipantInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SessionParticipantInvite_sessionId_email_key" ON "SessionParticipantInvite"("sessionId", "email");

-- Session feedback
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "authorName" TEXT,
    "authorEmail" TEXT,
    "rating" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionFeedback_pkey" PRIMARY KEY ("id")
);

-- Session table
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "visibility" TEXT NOT NULL,
    "hostOrganisation" TEXT NOT NULL,
    "summary" TEXT,
    "outcomes" JSONB,
    "format" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Expert table
CREATE TABLE "Expert" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "expertise" JSONB NOT NULL,
    "contactEmail" TEXT,
    "organisation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Expert_pkey" PRIMARY KEY ("id")
);

-- Session invites
CREATE TABLE "SessionInvite" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SessionInvite_sessionId_expertId_key" ON "SessionInvite"("sessionId", "expertId");

-- Role mapping
CREATE TABLE "RoleMapping" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "domain" TEXT,
    "roles" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RoleMapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoleMapping_email_key" ON "RoleMapping"("email");
CREATE UNIQUE INDEX "RoleMapping_domain_key" ON "RoleMapping"("domain");

-- User table
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

-- Add foreign keys
ALTER TABLE "SessionParticipantInvite" ADD CONSTRAINT "SessionParticipantInvite_sessionId_fkey" 
  FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionFeedback" ADD CONSTRAINT "SessionFeedback_sessionId_fkey" 
  FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionInvite" ADD CONSTRAINT "SessionInvite_sessionId_fkey" 
  FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionInvite" ADD CONSTRAINT "SessionInvite_expertId_fkey" 
  FOREIGN KEY ("expertId") REFERENCES "Expert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
