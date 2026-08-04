-- CreateEnum
CREATE TYPE "StatusPeriode" AS ENUM ('AKTIF', 'DITUTUP');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anggota" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "no_hp" TEXT,
    "alamat" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anggota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang" (
    "id" SERIAL NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "harga_default" DECIMAL(15,2) NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nota" (
    "id" SERIAL NOT NULL,
    "nomor_nota" TEXT NOT NULL,
    "anggota_id" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "catatan" TEXT,

    CONSTRAINT "nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nota_item" (
    "id" SERIAL NOT NULL,
    "nota_id" INTEGER NOT NULL,
    "barang_id" INTEGER,
    "nama_barang" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "nota_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periode" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "total_laba" DECIMAL(15,2),
    "status" "StatusPeriode" NOT NULL DEFAULT 'AKTIF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembagian" (
    "id" SERIAL NOT NULL,
    "periode_id" INTEGER NOT NULL,
    "anggota_id" INTEGER NOT NULL,
    "total_belanja" DECIMAL(15,2) NOT NULL,
    "proporsi" DECIMAL(10,6) NOT NULL,
    "nominal_shu" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "pembagian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "nota_nomor_nota_key" ON "nota"("nomor_nota");

-- CreateIndex
CREATE UNIQUE INDEX "pembagian_periode_id_anggota_id_key" ON "pembagian"("periode_id", "anggota_id");

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_anggota_id_fkey" FOREIGN KEY ("anggota_id") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota_item" ADD CONSTRAINT "nota_item_nota_id_fkey" FOREIGN KEY ("nota_id") REFERENCES "nota"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota_item" ADD CONSTRAINT "nota_item_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembagian" ADD CONSTRAINT "pembagian_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembagian" ADD CONSTRAINT "pembagian_anggota_id_fkey" FOREIGN KEY ("anggota_id") REFERENCES "anggota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
