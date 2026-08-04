import { Request, Response } from 'express';
import { getLaporanShu } from '../services/laporan';

export async function getLaporanShuController(req: Request, res: Response): Promise<void> {
  try {
    const periodeId = Number(req.params.periodeId);
    const data = await getLaporanShu(periodeId);
    res.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil laporan';
    res.status(msg.includes('tidak ditemukan') ? 404 : 400).json({ error: msg });
  }
}
