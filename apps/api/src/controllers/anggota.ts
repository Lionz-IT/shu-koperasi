import { Request, Response } from 'express';
import * as anggotaService from '../services/anggota';

export async function listAnggotaController(req: Request, res: Response): Promise<void> {
  try {
    const { aktif, search } = req.query;
    let aktifFilter: boolean | undefined;
    
    if (aktif === 'true') aktifFilter = true;
    else if (aktif === 'false') aktifFilter = false;
    
    const anggota = await anggotaService.listAnggota({
      aktif: aktifFilter,
      search: typeof search === 'string' ? search : undefined
    });
    
    res.json(anggota);
  } catch {
    res.status(500).json({ error: 'Gagal mengambil data anggota' });
  }
}

export async function getAnggotaController(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const anggota = await anggotaService.getAnggota(id);
    res.json(anggota);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data anggota';
    res.status(404).json({ error: message });
  }
}

export async function createAnggotaController(req: Request, res: Response): Promise<void> {
  try {
    const anggota = await anggotaService.createAnggota(req.body);
    res.status(201).json(anggota);
  } catch {
    res.status(500).json({ error: 'Gagal membuat anggota' });
  }
}

export async function updateAnggotaController(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const anggota = await anggotaService.updateAnggota(id, req.body);
    res.json(anggota);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah data anggota';
    res.status(message === 'Anggota tidak ditemukan' ? 404 : 500).json({ error: message });
  }
}

export async function deleteAnggotaController(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const anggota = await anggotaService.deleteAnggota(id);
    res.json(anggota);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus anggota';
    res.status(message === 'Anggota tidak ditemukan' ? 404 : 500).json({ error: message });
  }
}
