import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { validate } from '../middleware/validate';
import { listNotaController, getNotaController, createNotaController, deleteNotaController } from '../controllers/nota';

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung'));
    }
  }
});

const createNotaSchema = z.object({
  anggotaId: z.coerce.number().int().positive('Anggota wajib diisi'),
  tanggal: z.coerce.date({ required_error: 'Tanggal wajib diisi', invalid_type_error: 'Format tanggal tidak valid' }),
  catatan: z.string().optional(),
  items: z.array(z.object({
    barangId: z.coerce.number().int().positive().optional(),
    namaBarang: z.string().min(1, 'Nama barang wajib diisi'),
    qty: z.coerce.number().int().positive('Qty harus lebih dari 0'),
    hargaSatuan: z.coerce.number().positive('Harga satuan harus lebih dari 0'),
    hargaModal: z.coerce.number().nonnegative('Harga modal tidak boleh negatif')
  })).min(1, 'Minimal 1 item nota wajib ada')
});

router.get('/', listNotaController);
router.get('/:id', getNotaController);
router.post('/', upload.single('foto'), validate(createNotaSchema), createNotaController);
router.delete('/:id', deleteNotaController);

export default router;
