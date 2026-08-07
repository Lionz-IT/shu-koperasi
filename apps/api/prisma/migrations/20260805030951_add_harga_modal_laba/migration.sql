/*
  Warnings:

  - Added the required column `harga_modal` to the `nota_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `laba` to the `nota_item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nota_item" ADD COLUMN     "harga_modal" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "laba" DECIMAL(15,2) NOT NULL;
