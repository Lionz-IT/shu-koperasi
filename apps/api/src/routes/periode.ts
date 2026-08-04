import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { listPeriodeController, getPeriodeController, createPeriodeController, updatePeriodeController, deletePeriodeController, tutupPeriodeController } from '../controllers/periode';

const router = Router();

const createSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  tanggalMulai: z.coerce.date({ required_error: 'Tanggal mulai wajib diisi' }),
  tanggalSelesai: z.coerce.date({ required_error: 'Tanggal selesai wajib diisi' })
});

const updateSchema = z.object({
  nama: z.string().min(1).optional(),
  tanggalMulai: z.coerce.date().optional(),
  tanggalSelesai: z.coerce.date().optional(),
  totalLaba: z.coerce.number().optional()
});

const tutupSchema = z.object({
  totalLaba: z.coerce.number().min(0, 'Total laba harus positif')
});

router.get('/', listPeriodeController);
router.get('/:id', getPeriodeController);
router.post('/', validate(createSchema), createPeriodeController);
router.put('/:id', validate(updateSchema), updatePeriodeController);
router.delete('/:id', deletePeriodeController);
router.post('/:id/tutup', validate(tutupSchema), tutupPeriodeController);

export default router;
