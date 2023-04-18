-- CreateTable
CREATE TABLE "Music" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "volume" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Music_guildId_key" ON "Music"("guildId");

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;
