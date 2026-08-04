import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  listBarangController,
  getBarangController,
  createBarangController,
  updateBarangController,
  deleteBarangController,
} from '../controllers/barang';

const router = Router();

const createBarangSchema = z.object({
  namaBarang: z.string().min(1, 'Nama barang wajib diisi'),
  hargaDefault: z.coerce.number().positive('Harga default harus lebih besar dari 0'),
});

const updateBarangSchema = z.object({
  namaBarang: z.string().min(1, 'Nama barang tidak boleh kosong').optional(),
  hargaDefault: z.coerce.number().positive('Harga default harus lebih besar dari 0').optional(),
  aktif: z.boolean().optional(),
});

router.get('/', listBarangController);
router.get('/:id', getBarangController);
router.post('/', validate(createBarangSchema), createBarangController);
router.put('/:id', validate(updateBarangSchema), updateBarangController);
router.delete('/:id', deleteBarangController);

export default router;
