import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export async function listAnggota(filter?: { aktif?: boolean; search?: string }) {
  const where: Prisma.AnggotaWhereInput = {};
  
  if (filter?.aktif !== undefined) {
    where.aktif = filter.aktif;
  }
  
  if (filter?.search) {
    where.nama = { contains: filter.search, mode: 'insensitive' };
  }
  
  return prisma.anggota.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAnggota(id: number) {
  const anggota = await prisma.anggota.findUnique({ where: { id } });
  if (!anggota) throw new Error('Anggota tidak ditemukan');
  return anggota;
}

export async function createAnggota(data: { nama: string; noHp?: string; alamat?: string }) {
  return prisma.anggota.create({ data });
}

export async function updateAnggota(id: number, data: { nama?: string; noHp?: string; alamat?: string; aktif?: boolean }) {
  const anggota = await prisma.anggota.findUnique({ where: { id } });
  if (!anggota) throw new Error('Anggota tidak ditemukan');
  
  return prisma.anggota.update({
    where: { id },
    data
  });
}

export async function deleteAnggota(id: number) {
  const anggota = await prisma.anggota.findUnique({ where: { id } });
  if (!anggota) throw new Error('Anggota tidak ditemukan');
  
  return prisma.anggota.update({
    where: { id },
    data: { aktif: false }
  });
}
