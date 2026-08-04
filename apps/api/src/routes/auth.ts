import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { loginController } from '../controllers/auth';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

router.post('/login', validate(loginSchema), loginController);

export default router;
