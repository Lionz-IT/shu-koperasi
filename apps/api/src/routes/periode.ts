import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { listPeriodeController, getPeriodeController, createPeriodeController, updatePeriodeController, deletePeriodeController, tutupPeriodeController, previewTutupController } from '../controllers/periode';

const router = Router();

const createSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  tanggalMulai: z.coerce.date({ required_error: 'Tanggal mulai wajib diisi' }),
  tanggalSelesai: z.coerce.date({ required_error: 'Tanggal selesai wajib diisi' })
});

const updateSchema = z.object({
  nama: z.string().min(1).optional(),
  tanggalMulai: z.coerce.date().optional(),
  tanggalSelesai: z.coerce.date().optional()
});

router.get('/', listPeriodeController);
router.get('/:id', getPeriodeController);
router.post('/', validate(createSchema), createPeriodeController);
router.put('/:id', validate(updateSchema), updatePeriodeController);
router.delete('/:id', deletePeriodeController);
router.get('/:id/preview-tutup', previewTutupController);
router.post('/:id/tutup', tutupPeriodeController);

export default router;
