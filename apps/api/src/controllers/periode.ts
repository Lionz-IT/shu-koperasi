import { Request, Response } from 'express';
import { listPeriode, getPeriode, createPeriode, updatePeriode, deletePeriode, tutupPeriode, previewTutupPeriode } from '../services/periode';

export async function listPeriodeController(req: Request, res: Response): Promise<void> {
  try {
    const periode = await listPeriode();
    res.json(periode);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Gagal mengambil data periode' });
  }
}

export async function getPeriodeController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const periode = await getPeriode(id);
    res.json(periode);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil periode';
    res.status(msg.includes('tidak ditemukan') ? 404 : 500).json({ error: msg });
  }
}

export async function createPeriodeController(req: Request, res: Response): Promise<void> {
  try {
    const periode = await createPeriode(req.body);
    res.status(201).json(periode);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Gagal membuat periode' });
  }
}

export async function updatePeriodeController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const periode = await updatePeriode(id, req.body);
    res.json(periode);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal mengubah periode';
    res.status(msg.includes('tidak ditemukan') ? 404 : 400).json({ error: msg });
  }
}

export async function deletePeriodeController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    await deletePeriode(id);
    res.json({ success: true, message: 'Periode berhasil dihapus' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus periode';
    res.status(msg.includes('tidak ditemukan') ? 404 : 400).json({ error: msg });
  }
}

export async function previewTutupController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const preview = await previewTutupPeriode(id);
    res.json(preview);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menghitung preview';
    res.status(msg.includes('tidak ditemukan') ? 404 : 500).json({ error: msg });
  }
}

export async function tutupPeriodeController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const periode = await tutupPeriode(id);
    res.json({ success: true, data: periode });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menutup periode';
    res.status(msg.includes('tidak ditemukan') ? 404 : 400).json({ error: msg });
  }
}
