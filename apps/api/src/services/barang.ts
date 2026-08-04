import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export async function listBarang(filter?: { aktif?: boolean; search?: string }) {
  const where: Prisma.BarangWhereInput = {};

  if (filter?.aktif !== undefined) {
    where.aktif = filter.aktif;
  }

  if (filter?.search) {
    where.namaBarang = {
      contains: filter.search,
      mode: 'insensitive',
    };
  }

  return prisma.barang.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBarang(id: number) {
  const barang = await prisma.barang.findUnique({ where: { id } });
  if (!barang) throw new Error('Barang tidak ditemukan');
  return barang;
}

export async function createBarang(data: { namaBarang: string; hargaDefault: number }) {
  return prisma.barang.create({
    data: {
      namaBarang: data.namaBarang,
      hargaDefault: new Prisma.Decimal(data.hargaDefault),
    },
  });
}

export async function updateBarang(
  id: number,
  data: { namaBarang?: string; hargaDefault?: number; aktif?: boolean }
) {
  const barang = await prisma.barang.findUnique({ where: { id } });
  if (!barang) throw new Error('Barang tidak ditemukan');

  const updateData: Prisma.BarangUpdateInput = {};
  if (data.namaBarang !== undefined) updateData.namaBarang = data.namaBarang;
  if (data.hargaDefault !== undefined) updateData.hargaDefault = new Prisma.Decimal(data.hargaDefault);
  if (data.aktif !== undefined) updateData.aktif = data.aktif;

  return prisma.barang.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteBarang(id: number) {
  const barang = await prisma.barang.findUnique({ where: { id } });
  if (!barang) throw new Error('Barang tidak ditemukan');

  return prisma.barang.update({
    where: { id },
    data: { aktif: false },
  });
}
