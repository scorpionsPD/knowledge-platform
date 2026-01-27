-- Role mapping table for domain/email-based role sync
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
