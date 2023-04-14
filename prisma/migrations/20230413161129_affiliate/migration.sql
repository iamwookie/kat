/*
  Warnings:

  - You are about to drop the column `name` on the `Affiliate` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Affiliate_name_key";

-- AlterTable
ALTER TABLE "Affiliate" DROP COLUMN "name";
