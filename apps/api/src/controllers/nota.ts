import { Request, Response } from 'express';
import { listNota, getNota, createNota, deleteNota } from '../services/nota';
import path from 'path';
import fs from 'fs';

export async function listNotaController(req: Request, res: Response): Promise<void> {
  try {
    const { anggotaId, tanggalDari, tanggalSampai, search } = req.query;
    const nota = await listNota({
      anggotaId: anggotaId ? Number(anggotaId) : undefined,
      tanggalDari: tanggalDari ? new Date(tanggalDari as string) : undefined,
      tanggalSampai: tanggalSampai ? new Date(tanggalSampai as string) : undefined,
      search: search as string,
    });
    res.json(nota);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data nota';
    res.status(500).json({ error: message });
  }
}

export async function getNotaController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const nota = await getNota(id);
    res.json(nota);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil nota';
    if (message === 'Nota tidak ditemukan') {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}

export async function createNotaController(req: Request, res: Response): Promise<void> {
  try {
    if (typeof req.body.items === 'string') {
      req.body.items = JSON.parse(req.body.items);
    }
    const data = { ...req.body };
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      data.fotoNota = `data:${mimeType};base64,${base64}`;
    }
    const nota = await createNota(data);
    res.status(201).json(nota);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat nota';
    res.status(400).json({ error: message });
  }
}

export async function deleteNotaController(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const nota = await getNota(id);
    await deleteNota(id);
    
    res.json({ success: true, message: 'Nota berhasil dihapus' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus nota';
    if (message === 'Nota tidak ditemukan') {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
}
