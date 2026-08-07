import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

interface ListNotaFilter {
  anggotaId?: number;
  tanggalDari?: Date;
  tanggalSampai?: Date;
  search?: string;
}

interface CreateNotaInput {
  nomorNota?: string;
  anggotaId: number;
  tanggal: Date;
  catatan?: string;
  fotoNota?: string;
  items: Array<{
    barangId?: number;
    namaBarang: string;
    qty: number;
    hargaModal: number;
    hargaSatuan: number;
  }>;
}

export async function listNota(filter?: ListNotaFilter) {
  const where: Prisma.NotaWhereInput = {};
  
  if (filter?.anggotaId) {
    where.anggotaId = filter.anggotaId;
  }
  
  if (filter?.tanggalDari || filter?.tanggalSampai) {
    where.tanggal = {};
    if (filter.tanggalDari) where.tanggal.gte = filter.tanggalDari;
    if (filter.tanggalSampai) where.tanggal.lte = filter.tanggalSampai;
  }
  
  if (filter?.search) {
    where.nomorNota = { contains: filter.search, mode: 'insensitive' };
  }

  const notas = await prisma.nota.findMany({
    where,
    include: {
      anggota: {
        select: { id: true, nama: true }
      },
      items: {
        select: { subtotal: true }
      }
    },
    orderBy: { tanggal: 'desc' }
  });

  return notas.map(nota => {
    const total = nota.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { items, ...notaWithoutItems } = nota;
    return {
      ...notaWithoutItems,
      total
    };
  });
}

export async function getNota(id: number) {
  const nota = await prisma.nota.findUnique({
    where: { id },
    include: {
      anggota: true,
      items: {
        include: {
          barang: true
        }
      }
    }
  });

  if (!nota) throw new Error('Nota tidak ditemukan');

  const total = nota.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  return {
    ...nota,
    total
  };
}

export async function createNota(data: CreateNotaInput) {
  return prisma.$transaction(async (tx) => {
    let nomorNota = data.nomorNota;
    
    // Auto-generate nomorNota if not provided
    if (!nomorNota) {
      const dateStr = data.tanggal.toISOString().slice(0, 10).replace(/-/g, '');
      const lastNota = await tx.nota.findFirst({
        where: { nomorNota: { startsWith: `NOTA-${dateStr}-` } },
        orderBy: { nomorNota: 'desc' }
      });
      
      let nextSeq = 1;
      if (lastNota) {
        const lastSeq = parseInt(lastNota.nomorNota.split('-')[2], 10);
        if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
      }
      
      nomorNota = `NOTA-${dateStr}-${nextSeq.toString().padStart(3, '0')}`;
    }

    const itemsToCreate = data.items.map((item) => {
      const hargaSatuan = item.hargaSatuan;
      const hargaModal = item.hargaModal;
      const subtotal = item.qty * hargaSatuan;
      const laba = (hargaSatuan - hargaModal) * item.qty;

      return {
        barangId: item.barangId,
        namaBarang: item.namaBarang,
        qty: item.qty,
        hargaModal: new Prisma.Decimal(hargaModal),
        hargaSatuan: new Prisma.Decimal(hargaSatuan),
        subtotal: new Prisma.Decimal(subtotal),
        laba: new Prisma.Decimal(laba)
      };
    });

    const nota = await tx.nota.create({
      data: {
        nomorNota,
        anggotaId: data.anggotaId,
        tanggal: data.tanggal,
        catatan: data.catatan,
        fotoNota: data.fotoNota,
        items: {
          create: itemsToCreate
        }
      },
      include: {
        items: true
      }
    });

    return nota;
  });
}

export async function deleteNota(id: number) {
  const nota = await prisma.nota.findUnique({ where: { id } });
  if (!nota) throw new Error('Nota tidak ditemukan');

  await prisma.nota.delete({
    where: { id }
  });
}
