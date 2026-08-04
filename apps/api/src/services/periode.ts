import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export async function listPeriode() {
  return prisma.periode.findMany({
    orderBy: { tanggalMulai: 'desc' }
  });
}

export async function getPeriode(id: number) {
  const periode = await prisma.periode.findUnique({
    where: { id },
    include: {
      pembagian: {
        include: {
          anggota: {
            select: { id: true, nama: true }
          }
        },
        orderBy: { nominalShu: 'desc' }
      }
    }
  });
  if (!periode) throw new Error('Periode tidak ditemukan');
  return periode;
}

export async function createPeriode(data: { nama: string, tanggalMulai: Date, tanggalSelesai: Date }) {
  const overlapping = await prisma.periode.findFirst({
    where: {
      OR: [
        {
          tanggalMulai: { lte: data.tanggalSelesai },
          tanggalSelesai: { gte: data.tanggalMulai }
        }
      ]
    }
  });
  if (overlapping) throw new Error('Tanggal periode bentrok dengan periode yang sudah ada');

  return prisma.periode.create({
    data: {
      nama: data.nama,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai,
      status: 'AKTIF'
    }
  });
}

export async function updatePeriode(id: number, data: { nama?: string, tanggalMulai?: Date, tanggalSelesai?: Date, totalLaba?: number }) {
  const periode = await prisma.periode.findUnique({ where: { id } });
  if (!periode) throw new Error('Periode tidak ditemukan');
  if (periode.status === 'DITUTUP') throw new Error('Tidak dapat mengubah periode yang sudah ditutup');

  return prisma.periode.update({
    where: { id },
    data: {
      nama: data.nama,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai,
      totalLaba: data.totalLaba !== undefined ? new Prisma.Decimal(data.totalLaba) : undefined
    }
  });
}

export async function deletePeriode(id: number) {
  const periode = await prisma.periode.findUnique({ where: { id } });
  if (!periode) throw new Error('Periode tidak ditemukan');
  if (periode.status === 'DITUTUP') throw new Error('Tidak dapat menghapus periode yang sudah ditutup');

  await prisma.periode.delete({ where: { id } });
}

export async function tutupPeriode(id: number, totalLabaInput: number) {
  const periode = await prisma.periode.findUnique({ where: { id } });
  if (!periode) throw new Error('Periode tidak ditemukan');
  if (periode.status === 'DITUTUP') throw new Error('Periode sudah ditutup');

  return prisma.$transaction(async (tx) => {
    const notas = await tx.nota.findMany({
      where: {
        tanggal: {
          gte: periode.tanggalMulai,
          lte: periode.tanggalSelesai
        }
      },
      include: { items: true }
    });

    if (notas.length === 0) throw new Error('Tidak ada nota dalam periode ini');

    const totalBelanjaPerAnggota = new Map<number, Prisma.Decimal>();
    for (const nota of notas) {
      let currentTotal = totalBelanjaPerAnggota.get(nota.anggotaId) || new Prisma.Decimal(0);
      for (const item of nota.items) {
        currentTotal = currentTotal.add(item.subtotal);
      }
      totalBelanjaPerAnggota.set(nota.anggotaId, currentTotal);
    }

    let grandTotal = new Prisma.Decimal(0);
    for (const total of totalBelanjaPerAnggota.values()) {
      grandTotal = grandTotal.add(total);
    }

    if (grandTotal.isZero()) throw new Error('Total belanja semua anggota 0, tidak bisa membagikan SHU');

    const dTotalLaba = new Prisma.Decimal(totalLabaInput);
    const pembagianData = [];

    for (const [anggotaId, totalBelanja] of totalBelanjaPerAnggota.entries()) {
      const proporsi = totalBelanja.dividedBy(grandTotal);
      const nominalShu = proporsi.mul(dTotalLaba);
      pembagianData.push({
        anggotaId,
        totalBelanja,
        proporsi,
        nominalShu
      });
    }

    await tx.pembagian.createMany({
      data: pembagianData.map(d => ({
        periodeId: id,
        ...d
      }))
    });

    await tx.periode.update({
      where: { id },
      data: {
        status: 'DITUTUP',
        totalLaba: dTotalLaba
      }
    });

    return tx.periode.findUniqueOrThrow({
      where: { id },
      include: {
        pembagian: {
          include: { anggota: { select: { id: true, nama: true } } },
          orderBy: { nominalShu: 'desc' }
        }
      }
    });
  });
}
