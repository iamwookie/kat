/*
  Warnings:

  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Subscription";

-- CreateTable
CREATE TABLE "Queue" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "textId" TEXT,
    "position" INTEGER NOT NULL DEFAULT -1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "textId" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Queue_guildId_key" ON "Queue"("guildId");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Queue"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;
