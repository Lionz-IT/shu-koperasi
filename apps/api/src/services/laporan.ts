import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export async function getLaporanShu(periodeId: number) {
  const periode = await prisma.periode.findUnique({
    where: { id: periodeId },
    include: {
      pembagian: {
        include: {
          anggota: { select: { id: true, nama: true } }
        },
        orderBy: { nominalShu: 'desc' }
      }
    }
  });

  if (!periode) throw new Error('Periode tidak ditemukan');
  if (periode.status !== 'DITUTUP') throw new Error('Periode belum ditutup');

  const totalBelanja = periode.pembagian.reduce(
    (sum: Prisma.Decimal, p: { totalBelanja: Prisma.Decimal }) => sum.add(p.totalBelanja),
    new Prisma.Decimal(0)
  );

  return {
    periode: {
      id: periode.id,
      nama: periode.nama,
      tanggalMulai: periode.tanggalMulai,
      tanggalSelesai: periode.tanggalSelesai,
      totalLaba: periode.totalLaba,
      status: periode.status
    },
    summary: {
      totalLaba: periode.totalLaba,
      totalBelanja,
      jumlahAnggota: periode.pembagian.length
    },
    pembagian: periode.pembagian
  };
}
