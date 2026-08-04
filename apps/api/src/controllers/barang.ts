import { Request, Response } from 'express';
import {
  listBarang,
  getBarang,
  createBarang,
  updateBarang,
  deleteBarang,
} from '../services/barang';
import { z } from 'zod';

export async function listBarangController(req: Request, res: Response): Promise<void> {
  try {
    const { aktif, search } = req.query;
    
    let isAktif: boolean | undefined;
    if (aktif === 'true') isAktif = true;
    else if (aktif === 'false') isAktif = false;

    const barang = await listBarang({
      aktif: isAktif,
      search: search ? String(search) : undefined,
    });
    res.json(barang);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data barang';
    res.status(500).json({ error: message });
  }
}

export async function getBarangController(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = z.coerce.number().parse(req.params.id);
    const barang = await getBarang(id);
    res.json(barang);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Barang tidak ditemukan';
    res.status(404).json({ error: message });
  }
}

export async function createBarangController(req: Request, res: Response): Promise<void> {
  try {
    const barang = await createBarang(req.body);
    res.status(201).json(barang);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat barang';
    res.status(400).json({ error: message });
  }
}

export async function updateBarangController(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = z.coerce.number().parse(req.params.id);
    const barang = await updateBarang(id, req.body);
    res.json(barang);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengupdate barang';
    res.status(404).json({ error: message });
  }
}

export async function deleteBarangController(req: Request<{ id: string }>, res: Response): Promise<void> {
  try {
    const id = z.coerce.number().parse(req.params.id);
    await deleteBarang(id);
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus barang';
    res.status(404).json({ error: message });
  }
}
