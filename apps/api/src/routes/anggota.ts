import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  listAnggotaController,
  getAnggotaController,
  createAnggotaController,
  updateAnggotaController,
  deleteAnggotaController
} from '../controllers/anggota';

const router = Router();

const createAnggotaSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  noHp: z.string().optional(),
  alamat: z.string().optional()
});

const updateAnggotaSchema = z.object({
  nama: z.string().min(1, 'Nama tidak boleh kosong').optional(),
  noHp: z.string().optional(),
  alamat: z.string().optional(),
  aktif: z.boolean().optional()
});

const paramsSchema = z.object({
  id: z.coerce.number().min(1, 'ID tidak valid')
});

// Middleware for parameter validation
const validateParams = (req: Request, res: Response, next: NextFunction) => {
  try {
    paramsSchema.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validasi parameter gagal',
        details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
      });
      return;
    }
    next(err);
  }
};

router.get('/', listAnggotaController);
router.get('/:id', validateParams, getAnggotaController);
router.post('/', validate(createAnggotaSchema), createAnggotaController);
router.put('/:id', validateParams, validate(updateAnggotaSchema), updateAnggotaController);
router.delete('/:id', validateParams, deleteAnggotaController);

export default router;
