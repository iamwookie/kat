-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "textId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_guildId_key" ON "Subscription"("guildId");
