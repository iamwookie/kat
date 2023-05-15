-- DropForeignKey
ALTER TABLE "Music" DROP CONSTRAINT "Music_guildId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_guildId_fkey";

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Queue"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;
